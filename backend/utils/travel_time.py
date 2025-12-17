"""
Shared Travel Time Calculation Utilities

Centralized travel time and mode logic used across
travel mode recommendations and itinerary planning.

This module ensures:
- Consistent travel time calculations
- Single source of truth for speed assumptions
- Reusable across the entire backend
"""

from enum import Enum
from typing import Dict, Optional

# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class TravelMode(str, Enum):
    """Supported travel modes in India"""
    FLIGHT = "flight"
    TRAIN = "train"
    BUS = "bus"
    CAR = "car"


# India-specific average speeds (km/h)
# These are realistic averages accounting for:
# - Road conditions, traffic, stops
# - Train speeds (mix of express and regular)
# - Flight speeds plus ground time
SPEED_CONFIG = {
    TravelMode.FLIGHT: {
        "cruise_speed": 700,  # km/h in air
        "fixed_buffer": 3.0   # hours (check-in, security, boarding, taxi)
    },
    TravelMode.TRAIN: {
        "avg_speed": 65  # km/h (mix of express/mail trains)
    },
    TravelMode.BUS: {
        "avg_speed": 45  # km/h (highways + stops)
    },
    TravelMode.CAR: {
        "avg_speed": 55  # km/h (realistic with breaks)
    }
}


# ============================================================================
# TIME CALCULATION FUNCTIONS
# ============================================================================

def calculate_travel_time(distance_km: int, mode: TravelMode) -> float:
    """
    Calculate estimated one-way travel time in hours.
    
    Why these calculations?
    - Flight: Includes significant ground time (check-in, security, taxi)
    - Train: Average speed accounts for stops and express/mail mix
    - Bus: Lower speed due to frequent stops and road conditions
    - Car: Realistic speed with rest breaks factored in
    
    Args:
        distance_km: Distance in kilometers
        mode: Travel mode
    
    Returns:
        Travel time in hours (float)
    
    Example:
        >>> calculate_travel_time(233, TravelMode.CAR)
        4.236  # ~4h 14m for Delhi to Agra
        >>> calculate_travel_time(2157, TravelMode.FLIGHT)
        6.081  # ~6h 5m for Delhi to Bangalore
    """
    if mode == TravelMode.FLIGHT:
        # Flight time = (distance / cruise speed) + fixed buffer
        flying_time = distance_km / SPEED_CONFIG[TravelMode.FLIGHT]["cruise_speed"]
        total_time = flying_time + SPEED_CONFIG[TravelMode.FLIGHT]["fixed_buffer"]
        return total_time
    
    elif mode == TravelMode.TRAIN:
        return distance_km / SPEED_CONFIG[TravelMode.TRAIN]["avg_speed"]
    
    elif mode == TravelMode.BUS:
        return distance_km / SPEED_CONFIG[TravelMode.BUS]["avg_speed"]
    
    elif mode == TravelMode.CAR:
        return distance_km / SPEED_CONFIG[TravelMode.CAR]["avg_speed"]
    
    return 0.0


def format_travel_time(hours: float) -> str:
    """
    Format travel time into human-readable string.
    
    Why ranges for long trips?
    - Accounts for variability in traffic, weather, stops
    - More realistic than precise times for 20+ hour journeys
    
    Args:
        hours: Time in hours
    
    Returns:
        Formatted string (e.g., "5h 30m" or "22-24 hours")
    
    Example:
        >>> format_travel_time(4.5)
        '4h 30m'
        >>> format_travel_time(0.75)
        '45m'
        >>> format_travel_time(25.0)
        '24-26 hours'
    """
    if hours < 1:
        minutes = int(hours * 60)
        return f"{minutes}m"
    
    # For short trips (< 12 hours), show exact time
    if hours < 12:
        h = int(hours)
        m = int((hours - h) * 60)
        if m > 0:
            return f"{h}h {m}m"
        return f"{h}h"
    
    # For long trips (≥ 12 hours), show range
    # Range is ±1 hour to account for variability
    lower = int(hours - 1)
    upper = int(hours + 1)
    return f"{lower}-{upper} hours"


# ============================================================================
# TRAVEL TIME FOR ALL MODES
# ============================================================================

def calculate_all_travel_times(distance_km: int) -> Dict[str, str]:
    """
    Calculate travel times for all modes at once.
    
    Convenience function for comparison tables in UI.
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        Dict mapping mode names to formatted time strings
    
    Example:
        >>> calculate_all_travel_times(461)  # Mumbai to Goa
        {
            'flight': '3h 39m',
            'train': '7h 5m',
            'bus': '10h 14m',
            'car': '8h 23m'
        }
    """
    times = {}
    for mode in TravelMode:
        travel_time = calculate_travel_time(distance_km, mode)
        times[mode.value] = format_travel_time(travel_time)
    return times


def get_fastest_mode(distance_km: int) -> TravelMode:
    """
    Determine the fastest travel mode for a given distance.
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        Fastest travel mode
    
    Example:
        >>> get_fastest_mode(2157)
        <TravelMode.FLIGHT: 'flight'>
        >>> get_fastest_mode(150)
        <TravelMode.CAR: 'car'>
    """
    times = {}
    for mode in TravelMode:
        times[mode] = calculate_travel_time(distance_km, mode)
    
    return min(times, key=times.get)


def get_slowest_mode(distance_km: int) -> TravelMode:
    """
    Determine the slowest travel mode for a given distance.
    
    Useful for budget travelers who prioritize cost over speed.
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        Slowest travel mode
    
    Example:
        >>> get_slowest_mode(461)
        <TravelMode.BUS: 'bus'>
    """
    times = {}
    for mode in TravelMode:
        times[mode] = calculate_travel_time(distance_km, mode)
    
    return max(times, key=times.get)


# ============================================================================
# TIME FEASIBILITY CHECKS
# ============================================================================

def is_mode_time_feasible(
    distance_km: int,
    days: int,
    mode: TravelMode,
    max_travel_percentage: float = 40.0
) -> tuple[bool, Optional[str]]:
    """
    Check if a travel mode is time-feasible for a trip.
    
    Why 40% default?
    - If one-way travel takes > 40% of total trip time, it's impractical
    - Accounts for round-trip travel taking ~80% of trip time
    - Leaves 20% for actual destination activities
    
    Args:
        distance_km: Distance in kilometers
        days: Trip duration in days
        mode: Travel mode to check
        max_travel_percentage: Maximum allowed travel time percentage (default: 40%)
    
    Returns:
        Tuple of (is_feasible, reason_if_not)
    
    Example:
        >>> is_mode_time_feasible(2157, 3, TravelMode.TRAIN)
        (False, 'Selected mode requires 33-35 hours one-way, which is too long for a 3-day trip...')
        
        >>> is_mode_time_feasible(2157, 5, TravelMode.TRAIN)
        (True, None)
    """
    travel_hours = calculate_travel_time(distance_km, mode)
    total_trip_hours = days * 24
    travel_percentage = (travel_hours / total_trip_hours) * 100
    
    if travel_percentage > max_travel_percentage:
        time_str = format_travel_time(travel_hours)
        return (
            False,
            f"Selected mode requires {time_str} one-way, "
            f"which is too long for a {days}-day trip. "
            f"Consider a faster mode or extend your trip duration."
        )
    
    return (True, None)


def get_time_feasible_modes(distance_km: int, days: int) -> list[TravelMode]:
    """
    Get all time-feasible travel modes for a trip.
    
    Args:
        distance_km: Distance in kilometers
        days: Trip duration in days
    
    Returns:
        List of feasible travel modes
    
    Example:
        >>> get_time_feasible_modes(2157, 3)
        [<TravelMode.FLIGHT: 'flight'>]  # Only flight is fast enough
        
        >>> get_time_feasible_modes(461, 3)
        [<TravelMode.FLIGHT: 'flight'>, <TravelMode.TRAIN: 'train'>, 
         <TravelMode.CAR: 'car'>, <TravelMode.BUS: 'bus'>]  # All modes work
    """
    feasible_modes = []
    for mode in TravelMode:
        is_feasible, _ = is_mode_time_feasible(distance_km, days, mode)
        if is_feasible:
            feasible_modes.append(mode)
    return feasible_modes


# ============================================================================
# ROUND-TRIP CALCULATIONS
# ============================================================================

def calculate_round_trip_time(distance_km: int, mode: TravelMode) -> float:
    """
    Calculate round-trip travel time.
    
    Args:
        distance_km: One-way distance in kilometers
        mode: Travel mode
    
    Returns:
        Round-trip time in hours
    
    Example:
        >>> calculate_round_trip_time(233, TravelMode.CAR)
        8.472  # ~8h 28m total for Delhi-Agra round trip
    """
    one_way = calculate_travel_time(distance_km, mode)
    return one_way * 2


def get_effective_trip_days(total_days: int, distance_km: int, mode: TravelMode) -> float:
    """
    Calculate effective days at destination after accounting for travel.
    
    Useful for itinerary planning to know actual exploration time.
    
    Args:
        total_days: Total trip duration
        distance_km: One-way distance
        mode: Travel mode
    
    Returns:
        Days available at destination (as float)
    
    Example:
        >>> get_effective_trip_days(3, 2157, TravelMode.FLIGHT)
        2.49  # ~2.5 days at Bangalore after Delhi-Bangalore flights
        
        >>> get_effective_trip_days(3, 2157, TravelMode.TRAIN)
        0.17  # Only ~4 hours at destination if taking train!
    """
    round_trip_hours = calculate_round_trip_time(distance_km, mode)
    total_hours = total_days * 24
    effective_hours = total_hours - round_trip_hours
    return effective_hours / 24


# ============================================================================
# COST ESTIMATION (RELATIVE)
# ============================================================================

def get_relative_cost_order() -> Dict[TravelMode, int]:
    """
    Get relative cost ranking for modes (1 = cheapest, 4 = most expensive).
    
    Based on typical Indian travel costs:
    - Bus: Cheapest
    - Train: Budget-friendly
    - Car: Mid-range (fuel + tolls)
    - Flight: Most expensive
    
    Returns:
        Dict mapping modes to cost rank
    
    Example:
        >>> order = get_relative_cost_order()
        >>> order[TravelMode.BUS]
        1  # Cheapest
        >>> order[TravelMode.FLIGHT]
        4  # Most expensive
    """
    return {
        TravelMode.BUS: 1,
        TravelMode.TRAIN: 2,
        TravelMode.CAR: 3,
        TravelMode.FLIGHT: 4
    }


def get_cheapest_mode() -> TravelMode:
    """Get the cheapest travel mode"""
    return TravelMode.BUS


def get_most_expensive_mode() -> TravelMode:
    """Get the most expensive travel mode"""
    return TravelMode.FLIGHT