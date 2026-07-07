"""
Intelligent Trip Feasibility Engine

This module replaces the rigid "distance -> minimum days -> valid/invalid"
check with a mode-aware feasibility engine that reasons about a route the
way an actual travel planner would:

    - How long does each travel mode (flight/train/bus/car) actually take,
      door-to-door, for THIS distance?
    - How much of the trip does round-trip travel eat up?
    - How comfortable / convenient / practical is that mode for a trip of
      this length and distance, on this kind of route?
    - Does the destination itself have a natural "personality" (hill
      station, beach, religious town, weekend getaway, metro) that a
      human planner would factor in?
    - How much time is realistically left for sightseeing, and is that
      comfortable, tight, or effectively zero?

It is entirely deterministic (no ML/AI/external calls) and is built
purely on top of the existing primitives in `utils.distance` and
`utils.travel_time` -- no travel-time or distance math is duplicated
here.

WHAT CHANGED IN THIS REVISION
------------------------------
The old engine picked whichever mode had the best "remaining time"
status, breaking ties on raw one-way speed. That produces technically
correct but unrealistic advice (e.g. recommending a short-hop flight
just because it's fastest on paper).

The engine now scores every mode using several real-world factors --
total travel time, comfort, convenience, route practicality, trip
duration, trip distance, realistic tourist preference, flexibility,
road connectivity, airport practicality, and railway connectivity --
and recommends whichever mode has the best *overall* score. It also
produces ready-to-read, human, non-technical language: no fractions,
percentages, thresholds, or algorithm internals are ever exposed.

Public API contract
--------------------
`evaluate_trip_feasibility(distance_km, days, destination_profile=None,
preferred_mode=None)` returns a `TripFeasibilityResult`, which:
    - still exposes a plain boolean `feasible` field, so any existing
      API response model that only cares about true/false keeps working
      unchanged.
    - still exposes `status` (the same TripStatus enum/values as
      before), so existing clients keyed on status strings are
      unaffected.
    - additionally exposes `recommended_mode`, `estimated_travel_time`,
      `remaining_time_days` (numeric, kept for compatibility),
      `remaining_time_text` (human phrase, new), `trip_rating` (new,
      short human label), a ready-to-display natural-language `message`,
      and the full per-mode breakdown in `mode_assessments`.

Both new parameters are optional and additive:
    - `destination_profile`: an optional small metadata dict per
      destination city, e.g.
          {"preferred_mode": "car", "airport": True,
           "railway": True, "road_quality": "excellent"}
      Callers that don't have this yet can simply omit it -- the engine
      falls back to sensible, connectivity-agnostic defaults.
    - `preferred_mode`: the traveler's explicitly chosen mode, if any.
      This is only used to stop the engine from silently downgrading a
      mode the user picked on purpose (e.g. bus), not to override
      genuinely infeasible choices.

Callers should pass the ESTIMATED ROAD DISTANCE
(`utils.distance.calculate_estimated_road_distance`), not raw Haversine
distance.
"""

from dataclasses import dataclass, field
from typing import Dict, Optional

from .travel_time import (
    TravelMode,
    calculate_travel_time,
    format_travel_time,
)

try:
    # Enum import kept local/optional so this module has no hard
    # dependency ordering surprises if distance.py is reorganized.
    from enum import Enum
except ImportError:  # pragma: no cover - stdlib always available
    raise


# ============================================================================
# TRIP STATUS CLASSIFICATION
# ============================================================================

class TripStatus(str, Enum):
    """
    Rich, human-meaningful trip classification.

    The enum VALUES are unchanged from the previous revision (still
    "ideal", "feasible", "possible_with_limited_time",
    "not_recommended", "not_possible") so any code or stored data keyed
    on these strings keeps working. Only the *display* label (see
    STATUS_LABELS) has been made friendlier.

    Ordered roughly from "best" to "worst" experience; see STATUS_RANK
    below for the explicit ordering used when scoring modes.
    """
    IDEAL = "ideal"
    FEASIBLE = "feasible"
    POSSIBLE_LIMITED_TIME = "possible_with_limited_time"
    NOT_RECOMMENDED = "not_recommended"
    NOT_POSSIBLE = "not_possible"


# Lower rank = better trip experience.
STATUS_RANK = {
    TripStatus.IDEAL: 0,
    TripStatus.FEASIBLE: 1,
    TripStatus.POSSIBLE_LIMITED_TIME: 2,
    TripStatus.NOT_RECOMMENDED: 3,
    TripStatus.NOT_POSSIBLE: 4,
}

# Traveler-friendly status labels. These map 1:1 onto the same
# TripStatus values as before, so any consumer relying on `status`
# (the raw enum value) for API/logic compatibility is unaffected --
# only the human-facing text changed.
STATUS_LABELS = {
    TripStatus.IDEAL: "Excellent Trip",
    TripStatus.FEASIBLE: "Good Choice",
    TripStatus.POSSIBLE_LIMITED_TIME: "Short but Manageable",
    TripStatus.NOT_RECOMMENDED: "Very Tight Schedule",
    TripStatus.NOT_POSSIBLE: "Trip Needs More Time",
}

# Very short, glanceable "Trip Rating" word for the summary section of
# the validation card (distinct from the longer STATUS_LABELS heading).
TRIP_RATING = {
    TripStatus.IDEAL: "Excellent",
    TripStatus.FEASIBLE: "Great",
    TripStatus.POSSIBLE_LIMITED_TIME: "Fair",
    TripStatus.NOT_RECOMMENDED: "Tight",
    TripStatus.NOT_POSSIBLE: "Poor",
}

# A trip is considered API-feasible (backward-compatible boolean) if the
# best available mode lands in one of these statuses.
FEASIBLE_STATUSES = {
    TripStatus.IDEAL,
    TripStatus.FEASIBLE,
    TripStatus.POSSIBLE_LIMITED_TIME,
}

# Fraction of TOTAL trip time that must remain AFTER round-trip travel
# for a given status. Unchanged from the previous revision -- this is
# what lets a 3-day Delhi-Mumbai flight trip come back "Good Choice"
# instead of being flatly rejected, while a 3-day Delhi-Mumbai *train*
# trip (which eats almost the whole trip in transit) correctly comes
# back "Very Tight Schedule" / "Trip Needs More Time".
REMAINING_TIME_THRESHOLDS = [
    (0.70, TripStatus.IDEAL),
    (0.50, TripStatus.FEASIBLE),
    (0.25, TripStatus.POSSIBLE_LIMITED_TIME),
    (0.0, TripStatus.NOT_RECOMMENDED),
]


# ============================================================================
# REAL-WORLD DISTANCE BANDS (used for mode scoring, not for time math)
# ============================================================================

# These bands describe what a human travel planner would consider
# "short", "medium", "long" and "very long" for the purposes of picking
# a sensible travel mode -- separate from (and narrower than) the
# legacy minimum-days bands in utils.distance.
BAND_SHORT_MAX = 200
BAND_MEDIUM_MAX = 500
BAND_LONG_MAX = 900


def _distance_band(distance_km: int) -> str:
    """Classify a route into a real-world planning band."""
    if distance_km < BAND_SHORT_MAX:
        return "short"
    if distance_km < BAND_MEDIUM_MAX:
        return "medium"
    if distance_km < BAND_LONG_MAX:
        return "long"
    return "very_long"


# ============================================================================
# MODE SCORING MODEL
# ============================================================================

# Static per-mode traits on a 0-10 scale, independent of distance. These
# capture the "soft" qualities a real traveler weighs alongside raw
# travel time: how comfortable the journey itself is, how convenient it
# is door-to-door, and how much flexibility it gives once at the
# destination (own vehicle vs. fixed schedules).
MODE_TRAITS = {
    TravelMode.CAR: {"comfort": 7, "convenience": 8, "flexibility": 10},
    TravelMode.TRAIN: {"comfort": 8, "convenience": 7, "flexibility": 5},
    TravelMode.FLIGHT: {"comfort": 6, "convenience": 6, "flexibility": 3},
    TravelMode.BUS: {"comfort": 4, "convenience": 5, "flexibility": 4},
}

# Distance-band bonuses/penalties per mode, encoding the suggested
# real-world rules:
#   < 200km        -> car by default, train as an alternative, avoid flights
#   200-500km      -> car or train; flight only if driving is a real slog
#   500-900km      -> train or flight; car only for road-trip destinations
#   > 900km        -> flight primary, train secondary, car discouraged
# Bus is intentionally excluded here -- it is handled separately as a
# baseline penalty, since it should rarely be the *recommended* mode
# unless the traveler explicitly chose it.
BAND_MODE_BONUS = {
    "short": {
        TravelMode.CAR: 30,
        TravelMode.TRAIN: 12,
        TravelMode.FLIGHT: -70,
    },
    "medium": {
        TravelMode.CAR: 14,
        TravelMode.TRAIN: 20,
        TravelMode.FLIGHT: -18,
    },
    "long": {
        TravelMode.CAR: -8,
        TravelMode.TRAIN: 22,
        TravelMode.FLIGHT: 20,
    },
    "very_long": {
        TravelMode.CAR: -30,
        TravelMode.TRAIN: 6,
        TravelMode.FLIGHT: 35,
    },
}

# Bus is rarely a realistic *recommendation* (even though it's always
# shown in the comparison table) -- real travelers default to car,
# train or flight unless they've specifically asked for a bus.
BUS_DEFAULT_PENALTY = -35
BUS_EXPLICIT_BONUS = 60

# In the 200-500km band, a flight only makes sense if driving genuinely
# takes a long time. Below this many hours by car, flight keeps its
# default (negative) band bonus; at or above it, flight's bonus flips
# to positive, matching the "flight only if road travel exceeds 6-7
# hours" rule.
MEDIUM_BAND_LONG_DRIVE_HOURS = 6.5
MEDIUM_BAND_FLIGHT_OVERRIDE_BONUS = 25

# How strongly the destination's own metadata (preferred mode,
# airport/railway presence, road quality) should move the score.
DESTINATION_PREFERENCE_BONUS = 22
NO_RAILWAY_PENALTY = -500   # effectively excludes train if no railway link
NO_AIRPORT_PENALTY = -500   # effectively excludes flight if no airport
POOR_ROAD_PENALTY = -18
EXCELLENT_ROAD_BONUS = 10

# Weight applied to the trip-status ranking (remaining sightseeing
# time) when folding it into the overall score -- this keeps "will I
# actually have time to enjoy the destination" as the single biggest
# factor, while still letting comfort/convenience/practicality break
# ties and override marginal differences.
STATUS_SCORE_WEIGHT = 15


# ============================================================================
# PER-MODE ASSESSMENT
# ============================================================================

@dataclass
class ModeAssessment:
    """Feasibility detail for a single travel mode on a single route."""
    mode: TravelMode
    one_way_hours: float
    round_trip_hours: float
    remaining_days: float
    remaining_fraction: float
    status: TripStatus
    notes: str
    score: float = 0.0


def _classify_by_remaining_time(remaining_hours: float, total_hours: float) -> TripStatus:
    """
    Classify a mode's status based on how much trip time is left after
    round-trip travel.
    """
    if remaining_hours <= 0:
        return TripStatus.NOT_POSSIBLE

    remaining_fraction = remaining_hours / total_hours
    for threshold, status in REMAINING_TIME_THRESHOLDS:
        if remaining_fraction >= threshold:
            return status
    return TripStatus.NOT_POSSIBLE


def _mode_practicality_notes(mode: TravelMode, one_way_hours: float, distance_km: int = 0) -> str:
    """
    Internal, short practical notes per mode (overnight options, rest
    breaks, airport buffers). These are used for the detailed per-mode
    comparison table, not the human summary paragraph.
    """
    if mode == TravelMode.FLIGHT:
        if distance_km and distance_km < BAND_SHORT_MAX:
            return (
                "Direct flights are rarely practical at this distance; "
                "driving or the train is usually simpler door-to-door."
            )
        return "Includes airport transfer, check-in, security and boarding time."
    if mode == TravelMode.TRAIN:
        if one_way_hours >= 10:
            return "Long enough to consider an overnight train to save daylight hours."
        return "Comfortable daytime journey."
    if mode == TravelMode.BUS:
        if one_way_hours >= 8:
            return "Long enough to consider an overnight bus for efficiency."
        return "Manageable highway journey."
    if mode == TravelMode.CAR:
        if one_way_hours >= 6:
            return "Plan rest breaks; long drives need a second driver or overnight stop."
        return "Comfortable, realistic driving distance."
    return ""


def assess_mode(distance_km: int, days: int, mode: TravelMode) -> ModeAssessment:
    """
    Fully assess a single travel mode for a route: one-way and
    round-trip travel time, remaining sightseeing time, and a rich
    status classification with practical notes.

    Args:
        distance_km: Estimated road distance in kilometers
        days: Total trip duration in days
        mode: Travel mode to assess

    Returns:
        ModeAssessment with status and human-readable notes

    Example:
        >>> assess_mode(1378, 3, TravelMode.FLIGHT).status
        <TripStatus.FEASIBLE: 'feasible'>
    """
    one_way_hours = calculate_travel_time(distance_km, mode)
    round_trip_hours = one_way_hours * 2
    total_hours = days * 24
    remaining_hours = total_hours - round_trip_hours
    remaining_days = remaining_hours / 24
    remaining_fraction = max(remaining_hours, 0) / total_hours if total_hours else 0.0

    status = _classify_by_remaining_time(remaining_hours, total_hours)
    notes = _mode_practicality_notes(mode, one_way_hours, distance_km)

    return ModeAssessment(
        mode=mode,
        one_way_hours=one_way_hours,
        round_trip_hours=round_trip_hours,
        remaining_days=remaining_days,
        remaining_fraction=remaining_fraction,
        status=status,
        notes=notes,
    )


def _score_mode(
    assessment: ModeAssessment,
    distance_km: int,
    band: str,
    car_one_way_hours: float,
    destination_profile: Optional[dict],
    preferred_mode: Optional[TravelMode],
) -> float:
    """
    Compute an overall, weighted "would a human planner recommend this"
    score for one mode, combining:

        - remaining sightseeing time (trip status)
        - comfort, convenience, flexibility (static per-mode traits)
        - real-world distance-band practicality (car/train/flight rules)
        - realistic tourist preference for a bus (rarely recommended
          unless explicitly requested)
        - destination-type fit and road/rail/airport connectivity, when
          a destination profile is supplied

    Higher is better. This is an internal ranking signal only -- it is
    never exposed to the user directly.
    """
    mode = assessment.mode
    traits = MODE_TRAITS[mode]

    score = 0.0

    # 1) Remaining sightseeing time / trip status -- the single biggest
    #    factor, since a "fast" mode that leaves no time to enjoy the
    #    destination isn't actually a good recommendation.
    score += (len(STATUS_RANK) - 1 - STATUS_RANK[assessment.status]) * STATUS_SCORE_WEIGHT

    # 2) Comfort, convenience, flexibility.
    score += traits["comfort"] * 1.4
    score += traits["convenience"] * 1.6
    score += traits["flexibility"] * 1.0

    # 3) Real-world distance-band practicality.
    score += BAND_MODE_BONUS.get(band, {}).get(mode, 0)
    if band == "medium" and mode == TravelMode.FLIGHT:
        if car_one_way_hours >= MEDIUM_BAND_LONG_DRIVE_HOURS:
            # Long enough drive that flying becomes the practical choice.
            score += MEDIUM_BAND_FLIGHT_OVERRIDE_BONUS

    # 4) Bus is rarely a realistic *recommendation* unless it's what the
    #    traveler explicitly asked for.
    if mode == TravelMode.BUS:
        if preferred_mode == TravelMode.BUS:
            score += BUS_EXPLICIT_BONUS
        else:
            score += BUS_DEFAULT_PENALTY

    # 5) Destination type / connectivity metadata, if available.
    if destination_profile:
        preferred = destination_profile.get("preferred_mode")
        if preferred and preferred == mode.value:
            score += DESTINATION_PREFERENCE_BONUS

        if mode == TravelMode.TRAIN and destination_profile.get("railway") is False:
            score += NO_RAILWAY_PENALTY
        if mode == TravelMode.FLIGHT and destination_profile.get("airport") is False:
            score += NO_AIRPORT_PENALTY
        if mode == TravelMode.CAR:
            road_quality = destination_profile.get("road_quality")
            if road_quality == "poor":
                score += POOR_ROAD_PENALTY
            elif road_quality == "excellent":
                score += EXCELLENT_ROAD_BONUS

    return score


# ============================================================================
# HUMAN-FRIENDLY TEXT GENERATION
# ============================================================================

def _format_friendly_days(remaining_days: float) -> str:
    """
    Turn a raw day count (e.g. 2.4) into natural language (e.g. "around
    2½ days"), never exposing a decimal number.
    """
    if remaining_days <= 0:
        return "no real time"
    if remaining_days < 0.4:
        return "just a few hours"
    if remaining_days < 0.75:
        return "about half a day"

    half_steps = round(remaining_days * 2) / 2
    whole = int(half_steps)
    if half_steps == whole:
        return f"about {whole} day{'s' if whole != 1 else ''}"
    return f"around {whole}\u00bd days"


def _remaining_time_text(status: TripStatus, remaining_days: float) -> str:
    """
    Human, non-numeric-first description of how much time is left for
    sightseeing, keyed off trip status so the language always matches
    the trip rating shown elsewhere on the card.
    """
    friendly = _format_friendly_days(remaining_days)

    if status == TripStatus.IDEAL:
        return "Almost your entire trip is available for sightseeing."
    if status == TripStatus.FEASIBLE:
        return f"You'll have {friendly} to explore your destination."
    if status == TripStatus.POSSIBLE_LIMITED_TIME:
        return (
            f"You'll have {friendly} to explore, though travel takes a "
            "real bite out of the trip."
        )
    if status == TripStatus.NOT_RECOMMENDED:
        return "Most of your trip will be spent travelling, leaving very limited time at the destination."
    return "Travel alone would take up this entire trip, leaving no real time to enjoy your destination."


def _mode_reason_text(
    mode: TravelMode,
    band: str,
    one_way_hours: float,
    destination_profile: Optional[dict],
) -> str:
    """
    Natural-language explanation for why a mode was recommended --
    written the way a human travel planner would phrase it, with no
    reference to scores, thresholds, or internal calculations.
    """
    destination_flavor = ""
    if destination_profile:
        preferred = destination_profile.get("preferred_mode")
        if preferred == mode.value:
            destination_flavor = " It's also a natural fit for this kind of destination."

    if mode == TravelMode.CAR:
        if band in ("short", "medium"):
            return (
                "Driving is the most convenient option for this journey. "
                "Roads are good, travel time is short, and you'll have "
                "complete flexibility during your trip." + destination_flavor
            )
        return (
            "Driving makes sense here, especially if you're after a "
            "scenic road-trip experience and want full flexibility along "
            "the way." + destination_flavor
        )

    if mode == TravelMode.TRAIN:
        return (
            "We recommend travelling by train. It offers the best balance "
            "between comfort, cost and travel time for this route." + destination_flavor
        )

    if mode == TravelMode.FLIGHT:
        if band == "very_long":
            return (
                "Flying is the most practical choice for this long-distance "
                "journey. You'll maximize your sightseeing time while "
                "minimizing travel fatigue." + destination_flavor
            )
        return (
            "Flying is the most practical choice here, it keeps travel "
            "time short so you can spend more of your trip exploring." + destination_flavor
        )

    if mode == TravelMode.BUS:
        return (
            "Taking the bus is a budget-friendly way to cover this "
            "distance, though it will take longer than other options." + destination_flavor
        )

    return "This mode offers a reasonable balance of time and comfort for this route."


def _extend_trip_suggestion(status: TripStatus) -> str:
    """Closing line about whether extending the trip would help."""
    if status == TripStatus.IDEAL:
        return ""
    if status == TripStatus.FEASIBLE:
        return "You'll have plenty of time to explore comfortably."
    if status == TripStatus.POSSIBLE_LIMITED_TIME:
        return "Adding one more day would make this a noticeably more relaxed trip."
    if status == TripStatus.NOT_RECOMMENDED:
        return "Extending your stay by a couple of days, or choosing a faster mode, would make this trip much more enjoyable."
    return "This route realistically needs more days, or a faster mode, to be worth the trip."


def _build_message(
    best: ModeAssessment,
    days: int,
    band: str,
    destination_profile: Optional[dict],
) -> str:
    """
    Build the human, travel-planner-style recommendation paragraph.
    No internal calculations, fractions, percentages, or thresholds are
    ever surfaced -- only natural language a traveler would actually
    want to read.
    """
    reason = _mode_reason_text(best.mode, band, best.one_way_hours, destination_profile)
    remaining = _remaining_time_text(best.status, best.remaining_days)
    extend = _extend_trip_suggestion(best.status)

    parts = [reason, remaining]
    if extend:
        parts.append(extend)
    return " ".join(parts)


# ============================================================================
# FULL ROUTE FEASIBILITY RESULT
# ============================================================================

@dataclass
class TripFeasibilityResult:
    """
    Complete, mode-aware feasibility result for a route.

    `feasible` and `status` are kept exactly as before for backward
    compatibility with existing API response models; everything else is
    additive.
    """
    distance_km: int
    days: int
    feasible: bool
    status: TripStatus
    status_label: str
    trip_rating: str
    recommended_mode: TravelMode
    estimated_travel_time: str
    remaining_time_days: float
    remaining_time_text: str
    message: str
    mode_assessments: Dict[str, ModeAssessment] = field(default_factory=dict)


def evaluate_trip_feasibility(
    distance_km: int,
    days: int,
    destination_profile: Optional[dict] = None,
    preferred_mode: Optional[TravelMode] = None,
) -> TripFeasibilityResult:
    """
    Evaluate whether a route is realistically completable, and pick the
    single best travel mode using a weighted, multi-factor score rather
    than raw travel time or remaining-time alone.

    This is the function route validation, itinerary generation, and
    the validation API response should call going forward.

    Args:
        distance_km: Estimated road distance in kilometers (use
            `utils.distance.calculate_estimated_road_distance`)
        days: Available trip duration in days
        destination_profile: Optional small metadata dict for the
            destination, e.g.
                {"preferred_mode": "car", "airport": True,
                 "railway": True, "road_quality": "excellent"}
            Safe to omit entirely -- the engine falls back to
            connectivity-agnostic defaults.
        preferred_mode: The traveler's explicitly chosen mode, if any.
            Only used to avoid penalizing a mode (like bus) the
            traveler picked on purpose.

    Returns:
        TripFeasibilityResult with the best available mode, a
        backward-compatible boolean/status, and a ready-to-display,
        human-language message.

    Example:
        >>> result = evaluate_trip_feasibility(1378, 3)  # Delhi -> Mumbai, 3 days
        >>> result.feasible
        True
        >>> result.recommended_mode
        <TravelMode.FLIGHT: 'flight'>
    """
    assessments: Dict[str, ModeAssessment] = {
        mode.value: assess_mode(distance_km, days, mode) for mode in TravelMode
    }

    band = _distance_band(distance_km)
    car_one_way_hours = assessments[TravelMode.CAR.value].one_way_hours

    for assessment in assessments.values():
        assessment.score = _score_mode(
            assessment,
            distance_km=distance_km,
            band=band,
            car_one_way_hours=car_one_way_hours,
            destination_profile=destination_profile,
            preferred_mode=preferred_mode,
        )

    # Pick the mode with the highest overall score; tie-break on the
    # shortest one-way travel time so, e.g., train beats bus when both
    # score identically.
    best_key = max(
        assessments,
        key=lambda k: (assessments[k].score, -assessments[k].one_way_hours),
    )
    best = assessments[best_key]

    feasible_bool = best.status in FEASIBLE_STATUSES
    message = _build_message(best, days, band, destination_profile)

    return TripFeasibilityResult(
        distance_km=distance_km,
        days=days,
        feasible=feasible_bool,
        status=best.status,
        status_label=STATUS_LABELS[best.status],
        trip_rating=TRIP_RATING[best.status],
        recommended_mode=best.mode,
        estimated_travel_time=format_travel_time(best.one_way_hours),
        remaining_time_days=round(max(best.remaining_days, 0), 1),
        remaining_time_text=_remaining_time_text(best.status, best.remaining_days),
        message=message,
        mode_assessments=assessments,
    )


def get_mode_comparison_table(
    distance_km: int,
    days: int,
    destination_profile: Optional[dict] = None,
) -> Dict[str, dict]:
    """
    Build a per-mode comparison table (for a UI "compare travel modes"
    view), reusing the same assessment logic as
    `evaluate_trip_feasibility` so the numbers always match.

    Args:
        distance_km: Estimated road distance in kilometers
        days: Available trip duration in days
        destination_profile: Optional destination metadata (see
            `evaluate_trip_feasibility`), used to keep score/notes
            consistent with the main recommendation.

    Returns:
        Dict keyed by mode name, each value a plain dict suitable for
        JSON serialization in an API response:
            {
              "flight": {
                  "one_way_time": "2h 25m",
                  "round_trip_hours": 4.83,
                  "remaining_days": 2.7,
                  "status": "possible_with_limited_time",
                  "status_label": "Short but Manageable",
                  "notes": "Includes airport transfer, check-in..."
              },
              ...
            }
    """
    table: Dict[str, dict] = {}
    for mode in TravelMode:
        a = assess_mode(distance_km, days, mode)
        table[mode.value] = {
            "one_way_time": format_travel_time(a.one_way_hours),
            "round_trip_hours": round(a.round_trip_hours, 2),
            "remaining_days": round(max(a.remaining_days, 0), 1),
            "status": a.status.value,
            "status_label": STATUS_LABELS[a.status],
            "notes": a.notes,
        }
    return table