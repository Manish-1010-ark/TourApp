// components/trip-preparation/ValidationCard.jsx
//
// Premium travel-planner style recommendation panel.
//
// Layout (see Part 7 of the design brief):
//   1. Header — status icon, friendly heading, route
//   2. Summary — Distance / Recommended mode / Travel time / Trip rating
//      (each fact shown exactly once — no repeated "Recommended Mode",
//      "Travel Time" etc. lower in the card)
//   3. Recommendation — a single human, non-technical paragraph
//      explaining why this mode was chosen, how much time is left for
//      sightseeing, and whether extending the trip would help
//   4. "Continue Planning" CTA
//
// No fractions, percentages, thresholds, or internal scoring details
// are ever shown — only natural travel-planner language.

const MODE_LABELS = {
  flight: "Flight",
  train: "Train",
  bus: "Bus",
  car: "Car",
};
const MODE_ICONS = { flight: "✈️", train: "🚂", bus: "🚌", car: "🚗" };

// Fallback-only estimate (rough average speed), used ONLY if the backend
// response doesn't include `estimated_travel_time` (e.g. an older API
// version). Whenever the backend provides real numbers, those are used
// instead — this is not part of any validation logic.
function estimateTravelTimeFallback(distanceKm) {
  const hours = distanceKm / 55;
  if (hours < 1) return "under an hour";
  const rounded = Math.round(hours);
  return `~${rounded} hr${rounded === 1 ? "" : "s"}`;
}

// Presentation config per rich trip status returned by the feasibility
// engine (utils.feasibility.TripStatus on the backend). The `heading`
// values here are only used as a fallback if the backend hasn't sent a
// `status_label` yet — new responses already carry friendly text
// ("Excellent Trip", "Good Choice", etc.) directly.
const STATUS_STYLES = {
  ideal: {
    card: "bg-emerald-50 border-emerald-200",
    badge: "bg-[var(--color-success)]",
    heading: "Excellent Trip",
    icon: "check",
  },
  feasible: {
    card: "bg-emerald-50 border-emerald-200",
    badge: "bg-[var(--color-success)]",
    heading: "Good Choice",
    icon: "check",
  },
  possible_with_limited_time: {
    card: "bg-amber-50 border-amber-200",
    badge: "bg-amber-500",
    heading: "Short but Manageable",
    icon: "warning",
  },
  not_recommended: {
    card: "bg-orange-50 border-orange-200",
    badge: "bg-[var(--color-warning)]",
    heading: "Very Tight Schedule",
    icon: "warning",
  },
  not_possible: {
    card: "bg-red-50 border-red-200",
    badge: "bg-red-500",
    heading: "Trip Needs More Time",
    icon: "warning",
  },
};

// Fallback trip-rating word, used only if the backend hasn't sent
// `trip_rating` yet.
const FALLBACK_TRIP_RATING = {
  ideal: "Excellent",
  feasible: "Great",
  possible_with_limited_time: "Fair",
  not_recommended: "Tight",
  not_possible: "Poor",
};

function resolveStyle(status, feasible) {
  if (status && STATUS_STYLES[status]) return STATUS_STYLES[status];
  // Older backend without `status` — fall back to the binary feasible flag.
  return feasible ? STATUS_STYLES.feasible : STATUS_STYLES.not_recommended;
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 13l4 4L19 7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 9v4m0 4h.01M10.3 3.9L2.7 17a2 2 0 001.7 3h15.2a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryTile({ icon, label, value }) {
  return (
    <div className="bg-white/70 rounded-2xl p-3 text-center">
      <div className="font-body text-lg font-bold text-[var(--color-headings)] leading-tight">
        {icon ? <span className="mr-1">{icon}</span> : null}
        {value}
      </div>
      <div className="text-[11px] font-body uppercase tracking-wide text-slate-500 mt-0.5">
        {label}
      </div>
    </div>
  );
}

export default function ValidationCard({
  validationResult,
  days,
  sourceCity,
  destinationCity,
  onContinue,
}) {
  const {
    feasible,
    distance_km,
    minimum_days,
    reason,
    status,
    status_label,
    trip_rating,
    recommended_mode,
    estimated_travel_time,
    message,
  } = validationResult;

  const style = resolveStyle(status, feasible);
  const heading = status_label || style.heading;
  const rating =
    trip_rating ||
    (status && FALLBACK_TRIP_RATING[status]) ||
    (feasible ? "Good" : "Tight");
  const travelTime =
    estimated_travel_time || estimateTravelTimeFallback(distance_km);
  const routeLabel =
    sourceCity && destinationCity ? `${sourceCity} → ${destinationCity}` : null;

  // The single recommendation paragraph. Newer backends send a ready-made,
  // human paragraph in `message`. Older backends (pre-refactor) sent a
  // line-based technical block ("Recommended Mode: ...") — that shape is
  // deliberately NOT rendered verbatim here, since it would reintroduce
  // the "algorithmic" feel this redesign removes. In that legacy case we
  // fall back to `reason`, or omit the section entirely.
  const looksLegacyMessage = message && message.startsWith("Recommended Mode:");
  const recommendationParagraph = !looksLegacyMessage ? message : null;

  return (
    <div
      className={`rounded-3xl p-6 border-2 animate-fade-in-up ${style.card}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${style.badge}`}
        >
          {style.icon === "check" ? <CheckIcon /> : <WarningIcon />}
        </div>
        <div>
          <div className="font-display text-xl font-bold text-[var(--color-headings)]">
            {heading}
          </div>
          {routeLabel && (
            <div className="text-sm font-body text-slate-500">{routeLabel}</div>
          )}
        </div>
      </div>

      <div className="h-px bg-black/10 mb-4" />

      {/* Summary — each fact appears exactly once */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryTile icon="📍" label="Distance" value={`${distance_km} km`} />
        {/* <SummaryTile
        // icon={recommended_mode ? MODE_ICONS[recommended_mode] : "🕒"}
        // label="Recommended"
        // value={
        //   recommended_mode
        //     ? (MODE_LABELS[recommended_mode] ?? recommended_mode)
        //     : `${minimum_days}d`
        // }
        /> */}
        <SummaryTile icon="🕒" label="Travel Time" value={`≈ ${travelTime}`} />
        <SummaryTile icon="⭐" label="Trip Rating" value={rating} />
      </div>

      <div className="h-px bg-black/10 my-4" />

      {/* Recommendation — one concise, human paragraph */}
      {recommendationParagraph ? (
        <p className="text-sm font-body text-slate-700 leading-relaxed">
          {recommendationParagraph}
        </p>
      ) : (
        <>
          {reason && (
            <div className="flex items-start gap-2 text-sm font-body text-orange-800">
              <span className="mt-0.5">💡</span>
              <span>{reason}</span>
            </div>
          )}
          {feasible && !reason && (
            <div className="text-sm font-body text-emerald-800">
              Planning {days} {days === 1 ? "day" : "days"} — choose a travel
              mode below to continue.
            </div>
          )}
        </>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        className="mt-5 w-full rounded-2xl py-2.5 font-body font-semibold text-sm text-[var(--color-headings)] bg-white/80 hover:bg-white transition-colors border border-black/5"
      >
        ✓ Continue Planning
      </button>
    </div>
  );
}
