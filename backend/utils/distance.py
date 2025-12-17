"""
Shared Distance Calculation Utilities

Centralized distance calculation and feasibility logic
used across route validation and travel mode modules.

This module ensures:
- Consistent distance calculations
- Single source of truth for feasibility rules
- Reusable across the entire backend
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
    Calculate distance and return as integer (rounded km).
    
    Wrapper around haversine_distance that returns clean integer
    for API responses and UI display.
    
    Args:
        lat1, lon1: Source coordinates
        lat2, lon2: Destination coordinates
    
    Returns:
        Distance in kilometers (int, rounded)
    
    Example:
        >>> calculate_distance(28.7041, 77.1025, 27.1767, 78.0081)
        233  # Delhi to Agra
    """
    distance = haversine_distance(lat1, lon1, lat2, lon2)
    return round(distance)


# ============================================================================
# INDIA-SPECIFIC FEASIBILITY RULES
# ============================================================================

def calculate_minimum_days(distance_km: int) -> int:
    """
    Determine minimum trip duration based on distance.
    
    These rules are based on:
    - Average Indian road/rail travel speeds
    - Need for rest and exploration time
    - Realistic pacing for tourists
    
    Rules:
    - ≤ 300 km  → 2 days (e.g., Delhi to Agra: 230km)
    - 300–700 km → 3 days (e.g., Mumbai to Goa: 580km)
    - 700–1200 km → 4 days (e.g., Delhi to Jaipur to Udaipur: 900km)
    - > 1200 km → 5 days (e.g., Delhi to Bangalore: 2100km)
    
    Why these thresholds?
    - 300km: ~5-6 hour drive, allows for same-day arrival + 1 full day
    - 700km: Overnight journey or full day travel + exploration time
    - 1200km: Long-distance trip requiring multiple days for travel + rest
    - >1200km: Cross-country trips needing flight or multi-day rail
    
    Args:
        distance_km: Distance in kilometers
    
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
    Complete feasibility check for a route.
    
    Convenience function that combines distance calculation and
    minimum days check with a helpful message.
    
    Args:
        distance_km: Distance in kilometers
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
    Calculate distance between two cities by name.
    
    Convenience function that looks up cities from database
    and calculates distance in one call.
    
    Args:
        city1_name: First city name
        city2_name: Second city name
    
    Returns:
        Distance in kilometers
    
    Raises:
        ValueError: If city not found
    
    Example:
        >>> calculate_city_distance("Mumbai", "Goa")
        461
    """
    from data.cities import get_city_by_name
    
    city1 = get_city_by_name(city1_name)
    city2 = get_city_by_name(city2_name)
    
    if not city1:
        raise ValueError(f"City '{city1_name}' not found in database")
    if not city2:
        raise ValueError(f"City '{city2_name}' not found in database")
    
    return calculate_distance(
        city1["lat"], city1["lon"],
        city2["lat"], city2["lon"]
    )


# ============================================================================
# BATCH OPERATIONS
# ============================================================================

def calculate_route_distance(cities: list[str]) -> int:
    """
    Calculate total distance for a multi-city route.
    
    Useful for itinerary planning with multiple stops.
    
    Args:
        cities: List of city names in order
    
    Returns:
        Total distance in kilometers
    
    Raises:
        ValueError: If any city not found or less than 2 cities
    
    Example:
        >>> calculate_route_distance(["Delhi", "Agra", "Jaipur"])
        470  # Delhi→Agra (233km) + Agra→Jaipur (237km)
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
        distance_km: Distance in kilometers
    
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
        distance_km: Distance in kilometers
    
    Returns:
        Cost multiplier relative to 300km baseline
    
    Example:
        >>> estimate_travel_cost_multiplier(300)
        1.0
        >>> estimate_travel_cost_multiplier(600)
        2.0
    """
    return distance_km / 300.0