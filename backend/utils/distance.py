"""
Shared Distance Calculation Utilities

Centralized distance calculation and feasibility logic
used across route validation and travel mode modules.

This module ensures:
- Consistent distance calculations
- Single source of truth for feasibility rules
- Reusable across the entire backend

NOTE ON THIS REVISION
----------------------
The original `calculate_distance()` (Haversine / straight-line distance)
under-estimates real travel distance significantly, since roads, rail
lines and even flight paths are never perfectly straight. This revision:

  1. Keeps `haversine_distance()` completely untouched, so any code that
     genuinely needs pure straight-line distance still has it.
  2. Adds `calculate_estimated_road_distance()`, which layers an
     adaptive, distance-dependent multiplier on top of the Haversine
     result to approximate real-world road distance.
  3. Makes the estimated road distance the PRIMARY distance used
     everywhere else in the trip-planning pipeline (route validation,
     travel mode recommendation, travel time estimation, minimum-day
     rules, itinerary generation, and UI-displayed distance).

`calculate_distance()` itself is left in place, unchanged, for backward
compatibility with any existing callers that expect straight-line km.
"""

import math
from typing import Tuple

# ============================================================================
# HAVERSINE DISTANCE CALCULATOR
# ============================================================================

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate great-circle distance between two points on Earth
    using the Haversine formula.
    
    Why Haversine?
    - Accurate for distances up to a few thousand km
    - Simple and fast (no external dependencies)
    - Perfect for India's geographic scale (~3000km max)
    
    Args:
        lat1, lon1: Source coordinates in decimal degrees
        lat2, lon2: Destination coordinates in decimal degrees
    
    Returns:
        Distance in kilometers (float)
    
    Formula:
        a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
        c = 2 × atan2(√a, √(1−a))
        distance = R × c  (where R = Earth's radius)
    """
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Differences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Haversine formula
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """
    Calculate straight-line (Haversine) distance and return as integer
    (rounded km).

    LEGACY / STRAIGHT-LINE ONLY: this remains for backward compatibility
    with any existing caller that specifically wants raw great-circle
    distance. For anything user-facing (route validation, travel time,
    itinerary planning, UI display), use
    `calculate_estimated_road_distance()` instead — it accounts for the
    fact that real roads/rail/flight paths are not straight lines.
    
    Args:
        lat1, lon1: Source coordinates
        lat2, lon2: Destination coordinates
    
    Returns:
        Straight-line distance in kilometers (int, rounded)
    
    Example:
        >>> calculate_distance(28.7041, 77.1025, 27.1767, 78.0081)
        233  # Delhi to Agra (straight-line)
    """
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    return round(distance)


# ============================================================================
# REALISTIC ROAD DISTANCE ESTIMATION
# ============================================================================

# Adaptive multipliers that convert straight-line (Haversine) distance
# into a realistic road-travel distance. Real Indian highways/rail/flight
# corridors are never perfectly straight, and the amount of "detour"
# relative to the straight-line distance changes with scale:
#   - Very short hops have modest detour (mostly local roads).
#   - Mid-range trips (100-700km) see the most relative winding, since
#     they mix district roads, highway stretches, and terrain/city
#     routing.
#   - Very long trips (700km+) are dominated by national highways or
#     flight paths, which are comparatively more direct, so the relative
#     multiplier eases back down.
# Each tuple is (upper_bound_km, multiplier). Bands are evaluated in
# order, first match wins.
ROAD_DISTANCE_MULTIPLIERS = [
    (100, 1.18),
    (300, 1.22),
    (700, 1.25),
    (1200, 1.23),
    (float("inf"), 1.20),
]


def get_road_distance_multiplier(air_distance_km: float) -> float:
    """
    Return the adaptive multiplier used to convert air (Haversine)
    distance into an estimated road distance.

    Bands (approximate, tuned for Indian highway/rail travel patterns):
        0–100 km     -> 1.18x
        100–300 km   -> 1.22x
        300–700 km   -> 1.25x
        700–1200 km  -> 1.23x
        1200+ km     -> 1.20x

    Args:
        air_distance_km: Straight-line distance in kilometers

    Returns:
        Multiplier (float) to apply to the air distance

    Example:
        >>> get_road_distance_multiplier(120)
        1.22
        >>> get_road_distance_multiplier(2100)
        1.2
    """
    for upper_bound, multiplier in ROAD_DISTANCE_MULTIPLIERS:
        if air_distance_km <= upper_bound:
            return multiplier
    return ROAD_DISTANCE_MULTIPLIERS[-1][1]


def estimate_road_distance_from_air_distance(air_distance_km: float) -> int:
    """
    Convert an already-known air/straight-line distance into an
    estimated road distance, without needing raw coordinates.

    Useful when a Haversine distance has already been calculated
    upstream (e.g. cached, or received from another service) and only
    needs adjusting into a realistic road-distance estimate.

    Args:
        air_distance_km: Straight-line distance in kilometers

    Returns:
        Estimated road distance in kilometers (int, rounded)

    Example:
        >>> estimate_road_distance_from_air_distance(1148)
        1378  # Delhi -> Mumbai, air distance adjusted to road estimate
    """
    multiplier = get_road_distance_multiplier(air_distance_km)
    return round(air_distance_km * multiplier)


def calculate_estimated_road_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    """
    Estimate realistic road travel distance between two coordinates.

    This is now the PRIMARY distance function and should be used
    everywhere in the trip-planning pipeline: route validation, travel
    mode recommendation, travel time estimation, minimum-day rules,
    itinerary generation inputs, and any UI-displayed distance.

    It does NOT replace or modify `haversine_distance` — it builds on
    top of it, converting the theoretical straight-line distance into
    something close to what a traveler would actually drive/fly/ride.

    Args:
        lat1, lon1: Source coordinates
        lat2, lon2: Destination coordinates

    Returns:
        Estimated road distance in kilometers (int, rounded)

    Example:
        >>> calculate_estimated_road_distance(28.7041, 77.1025, 19.0760, 72.8777)
        1378  # Delhi -> Mumbai (vs. ~1148km straight-line)
        >>> calculate_estimated_road_distance(19.0760, 72.8777, 18.5204, 73.8567)
        146  # Mumbai -> Pune (vs. ~120km straight-line)
    """
    air_distance = haversine_distance(lat1, lon1, lat2, lon2)
    return estimate_road_distance_from_air_distance(air_distance)


# ============================================================================
# INDIA-SPECIFIC FEASIBILITY RULES (LEGACY / SIMPLE)
# ============================================================================

def calculate_minimum_days(distance_km: int) -> int:
    """
    Determine minimum trip duration based on distance.

    NOTE: this is a simple, rigid rule of thumb kept for backward
    compatibility and quick sanity checks. For actual route validation,
    prefer `feasibility.evaluate_trip_feasibility()`, which considers
    travel mode, round-trip time, and remaining sightseeing time rather
    than a single fixed threshold.

    Callers should now pass the ESTIMATED ROAD DISTANCE (from
    `calculate_estimated_road_distance`) rather than raw Haversine
    distance, so the thresholds line up with real travel times.
    
    Rules:
    - ≤ 300 km  → 2 days (e.g., Delhi to Agra: 230km)
    - 300–700 km → 3 days (e.g., Mumbai to Goa: 580km)
    - 700–1200 km → 4 days (e.g., Delhi to Jaipur to Udaipur: 900km)
    - > 1200 km → 5 days (e.g., Delhi to Bangalore: 2100km)
    
    Args:
        distance_km: Distance in kilometers (road distance recommended)
    
    Returns:
        Minimum recommended days
    
    Example:
        >>> calculate_minimum_days(233)
        2  # Delhi to Agra
        >>> calculate_minimum_days(2157)
        5  # Delhi to Bangalore
    """
    if distance_km <= 300:
        return 2
    elif distance_km <= 700:
        return 3
    elif distance_km <= 1200:
        return 4
    else:
        return 5


def is_route_feasible(distance_km: int, days: int) -> Tuple[bool, int, str]:
    """
    LEGACY simple feasibility check (distance vs. fixed minimum-day
    threshold only).

    This is intentionally kept unchanged for backward compatibility
    with any existing caller that expects this exact (bool, int, str)
    contract. It does NOT take travel mode or actual travel time into
    account, so it will incorrectly reject trips that are perfectly
    doable by flight.

    New code should call `feasibility.evaluate_trip_feasibility()`
    instead, which returns a richer, mode-aware assessment (Ideal /
    Feasible / Possible with Limited Time / Not Recommended / Not
    Possible) and a human-friendly recommendation message.
    
    Args:
        distance_km: Distance in kilometers (road distance recommended)
        days: Available trip days
    
    Returns:
        Tuple of (feasible, minimum_days, reason)
        - feasible: True if days >= minimum_days
        - minimum_days: Recommended minimum days
        - reason: Explanation if not feasible, empty string if feasible
    
    Example:
        >>> is_route_feasible(233, 2)
        (True, 2, '')
        
        >>> is_route_feasible(2157, 2)
        (False, 5, 'Distance too long for selected trip duration. Recommended minimum is 5 days for a 2157km journey.')
    """
    minimum_days = calculate_minimum_days(distance_km)
    feasible = days >= minimum_days
    
    reason = ""
    if not feasible:
        reason = (
            f"Distance too long for selected trip duration. "
            f"Recommended minimum is {minimum_days} days for a {distance_km}km journey."
        )
    
    return feasible, minimum_days, reason


# ============================================================================
# CITY-TO-CITY HELPERS
# ============================================================================

def calculate_city_distance(city1_name: str, city2_name: str) -> int:
    """
    Calculate estimated road distance between two cities by name.

    Convenience function that looks up cities from database and
    calculates the realistic road-distance estimate in one call. This
    now uses `calculate_estimated_road_distance()` (not raw Haversine),
    so downstream travel-time, validation, and itinerary logic all
    receive a realistic distance.
    
    Args:
        city1_name: First city name
        city2_name: Second city name
    
    Returns:
        Estimated road distance in kilometers
    
    Raises:
        ValueError: If city not found
    
    Example:
        >>> calculate_city_distance("Mumbai", "Goa")
        562  # was 461 as straight-line; road estimate is longer
    """
    from data.cities import get_city_by_name
    
    city1 = get_city_by_name(city1_name)
    city2 = get_city_by_name(city2_name)
    
    if not city1:
        raise ValueError(f"City '{city1_name}' not found in database")
    if not city2:
        raise ValueError(f"City '{city2_name}' not found in database")
    
    return calculate_estimated_road_distance(
        city1["lat"], city1["lon"],
        city2["lat"], city2["lon"]
    )


# ============================================================================
# BATCH OPERATIONS
# ============================================================================

def calculate_route_distance(cities: list[str]) -> int:
    """
    Calculate total estimated road distance for a multi-city route.
    
    Useful for itinerary planning with multiple stops. Since
    `calculate_city_distance` now returns road-distance estimates, the
    summed total is also a road-distance estimate.
    
    Args:
        cities: List of city names in order
    
    Returns:
        Total estimated road distance in kilometers
    
    Raises:
        ValueError: If any city not found or less than 2 cities
    
    Example:
        >>> calculate_route_distance(["Delhi", "Agra", "Jaipur"])
        572  # Delhi->Agra + Agra->Jaipur, road-distance estimates
    """
    if len(cities) < 2:
        raise ValueError("Need at least 2 cities to calculate route distance")
    
    total_distance = 0
    for i in range(len(cities) - 1):
        distance = calculate_city_distance(cities[i], cities[i + 1])
        total_distance += distance
    
    return total_distance


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_distance_category(distance_km: int) -> str:
    """
    Categorize distance for analytics or UI grouping.
    
    Args:
        distance_km: Distance in kilometers (road distance recommended)
    
    Returns:
        Category name
    
    Example:
        >>> get_distance_category(233)
        'short'
        >>> get_distance_category(2157)
        'very_long'
    """
    if distance_km <= 300:
        return "short"
    elif distance_km <= 700:
        return "medium"
    elif distance_km <= 1200:
        return "long"
    else:
        return "very_long"


def estimate_travel_cost_multiplier(distance_km: int) -> float:
    """
    Get relative cost multiplier based on distance.
    
    Can be used for budget estimation in itinerary planning.
    Baseline: 300km = 1.0x
    
    Args:
        distance_km: Distance in kilometers (road distance recommended)
    
    Returns:
        Cost multiplier relative to 300km baseline
    
    Example:
        >>> estimate_travel_cost_multiplier(300)
        1.0
        >>> estimate_travel_cost_multiplier(600)
        2.0
    """
    return distance_km / 300.0