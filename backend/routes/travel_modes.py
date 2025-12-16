# routes/travel_modes.py
"""
Module 3: Travel Mode, Distance & Time Engine (Deterministic)

This module recommends optimal travel modes and validates user preferences
based on distance and trip duration. Uses India-specific travel assumptions.

NO AI MODELS | NO EXTERNAL APIS | PURE LOGIC
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum

router = APIRouter()

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
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class TravelModeRequest(BaseModel):
    """Request for travel mode recommendations"""
    distance_km: int = Field(..., ge=1, le=5000, description="Distance in kilometers")
    days: int = Field(..., ge=1, le=30, description="Trip duration in days")
    preferred_mode: Optional[TravelMode] = Field(None, description="User's preferred travel mode")

class TravelModeResponse(BaseModel):
    """Response with travel mode recommendations and validation"""
    recommended_modes: List[str]
    estimated_times: Dict[str, str]  # Changed from Optional[str] to str
    preferred_mode_valid: bool
    preferred_mode_reason: Optional[str] = None

# ============================================================================
# TIME CALCULATION HELPERS
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
# MODE RECOMMENDATION LOGIC
# ============================================================================

def get_recommended_modes(distance_km: int) -> List[TravelMode]:
    """
    Recommend travel modes based on distance.
    
    Why these distance brackets?
    - ≤ 300 km: Road travel is efficient and flexible
    - 300-700 km: Rail becomes competitive, bus still viable
    - 700-1200 km: Long distance, rail/air best
    - > 1200 km: Air travel becomes necessary for time efficiency
    
    Distance-based logic (India-specific):
    - Short (≤ 300 km): Car, Bus
      Example: Delhi-Agra (230km), Mumbai-Pune (150km)
    
    - Medium (300-700 km): Train, Bus
      Example: Mumbai-Goa (580km), Delhi-Jaipur (280km)
    
    - Long (700-1200 km): Train, Flight
      Example: Delhi-Mumbai (1400km), Bangalore-Hyderabad (575km)
    
    - Very Long (> 1200 km): Flight (primary), Train (secondary)
      Example: Delhi-Bangalore (2150km), Mumbai-Kolkata (2000km)
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        List of recommended travel modes (ordered by preference)
    """
    if distance_km <= 300:
        # Short distance: Road transport is most efficient
        return [TravelMode.CAR, TravelMode.BUS]
    
    elif distance_km <= 700:
        # Medium distance: Train and bus are optimal
        return [TravelMode.TRAIN, TravelMode.BUS]
    
    elif distance_km <= 1200:
        # Long distance: Train or flight depending on comfort/budget
        return [TravelMode.TRAIN, TravelMode.FLIGHT]
    
    else:
        # Very long distance: Flight is primary recommendation
        return [TravelMode.FLIGHT, TravelMode.TRAIN]

# ============================================================================
# MODE FEASIBILITY VALIDATION
# ============================================================================

def validate_preferred_mode(
    distance_km: int,
    days: int,
    preferred_mode: TravelMode,
    recommended_modes: List[TravelMode]
) -> tuple[bool, Optional[str]]:
    """
    Validate if user's preferred travel mode is feasible.
    
    Two validation checks:
    1. Is the mode in recommended modes for this distance?
    2. Does travel time leave enough time for the actual trip?
    
    Why 40% rule?
    - If one-way travel takes > 40% of total trip time, it's impractical
    - Example: 3-day trip = 72 hours. If travel takes > 28.8 hours one-way,
      you spend more time traveling than enjoying the destination
    - This accounts for round-trip travel taking ~80% of trip time
    
    Args:
        distance_km: Distance in kilometers
        days: Trip duration in days
        preferred_mode: User's preferred mode
        recommended_modes: System-recommended modes
    
    Returns:
        Tuple of (is_valid, reason_if_invalid)
    """
    # Check 1: Is mode in recommended list?
    if preferred_mode not in recommended_modes:
        return (
            False,
            f"Selected mode is not realistic for {distance_km}km distance. "
            f"Recommended: {', '.join([m.value for m in recommended_modes])}."
        )
    
    # Check 2: Time feasibility (40% rule)
    travel_hours = calculate_travel_time(distance_km, preferred_mode)
    total_trip_hours = days * 24
    travel_percentage = (travel_hours / total_trip_hours) * 100
    
    if travel_percentage > 40:
        return (
            False,
            f"Selected mode requires {format_travel_time(travel_hours)} one-way, "
            f"which is too long for a {days}-day trip. "
            f"Consider a faster mode or extend your trip duration."
        )
    
    # All checks passed
    return (True, None)

# ============================================================================
# MAIN ENDPOINT
# ============================================================================

@router.post("/api/travel/modes", response_model=TravelModeResponse)
async def get_travel_modes(request: TravelModeRequest):
    """
    Get travel mode recommendations and validate preferred mode.
    
    This endpoint provides:
    1. Distance-appropriate travel mode recommendations
    2. Estimated travel times for all modes
    3. Validation of user's preferred mode (if provided)
    
    Logic flow:
    - Calculate recommended modes based on distance brackets
    - Calculate estimated times for ALL modes (for comparison)
    - If user provided preferred mode, validate against:
      a) Distance-appropriate modes
      b) Time feasibility (40% rule)
    
    Args:
        request: TravelModeRequest with distance, days, and optional preferred mode
    
    Returns:
        TravelModeResponse with recommendations and validation
    """
    
    # Step 1: Get distance-based recommendations
    recommended_modes = get_recommended_modes(request.distance_km)
    
    # Step 2: Calculate estimated times for ALL modes
    # Why all modes? So users can compare even if not recommended
    estimated_times = {}
    for mode in TravelMode:
        travel_time = calculate_travel_time(request.distance_km, mode)
        estimated_times[mode.value] = format_travel_time(travel_time)
    
    # Step 3: Validate preferred mode (if provided)
    preferred_mode_valid = True
    preferred_mode_reason = None
    
    if request.preferred_mode is not None:
        preferred_mode_valid, preferred_mode_reason = validate_preferred_mode(
            request.distance_km,
            request.days,
            request.preferred_mode,
            recommended_modes
        )
    
    # Step 4: Return response
    return TravelModeResponse(
        recommended_modes=[mode.value for mode in recommended_modes],
        estimated_times=estimated_times,
        preferred_mode_valid=preferred_mode_valid,
        preferred_mode_reason=preferred_mode_reason
    )

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/travel/health")
async def travel_health():
    """Health check for travel mode service"""
    return {
        "status": "ok",
        "service": "travel_modes",
        "supported_modes": [mode.value for mode in TravelMode],
        "speed_assumptions": {
            "flight": "700 km/h + 3h buffer",
            "train": "65 km/h average",
            "bus": "45 km/h average",
            "car": "55 km/h average"
        },
        "recommendation_logic": {
            "0-300km": "car, bus",
            "300-700km": "train, bus",
            "700-1200km": "train, flight",
            ">1200km": "flight, train"
        }
    }

# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

"""
Example 1: Short trip - Delhi to Agra (230km, 2 days)
POST /api/travel/modes
{
  "distance_km": 230,
  "days": 2,
  "preferred_mode": null
}
Response:
{
  "recommended_modes": ["car", "bus"],
  "estimated_times": {
    "flight": "3h 20m",
    "train": "3h 32m",
    "bus": "5h 6m",
    "car": "4h 11m"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

Example 2: Medium trip - Mumbai to Goa (461km, 3 days)
POST /api/travel/modes
{
  "distance_km": 461,
  "days": 3,
  "preferred_mode": "train"
}
Response:
{
  "recommended_modes": ["train", "bus"],
  "estimated_times": {
    "flight": "3h 40m",
    "train": "7h 5m",
    "bus": "10h 14m",
    "car": "8h 23m"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

Example 3: Long trip - Delhi to Bangalore (2157km, 3 days) - INVALID
POST /api/travel/modes
{
  "distance_km": 2157,
  "days": 3,
  "preferred_mode": "train"
}
Response:
{
  "recommended_modes": ["flight", "train"],
  "estimated_times": {
    "flight": "6h 5m",
    "train": "33-35 hours",
    "bus": "47-49 hours",
    "car": "39-41 hours"
  },
  "preferred_mode_valid": false,
  "preferred_mode_reason": "Selected mode requires 33-35 hours one-way, which is too long for a 3-day trip. Consider a faster mode or extend your trip duration."
}

---

Example 4: Long trip - Delhi to Bangalore (2157km, 5 days) - VALID
POST /api/travel/modes
{
  "distance_km": 2157,
  "days": 5,
  "preferred_mode": "train"
}
Response:
{
  "recommended_modes": ["flight", "train"],
  "estimated_times": {
    "flight": "6h 5m",
    "train": "33-35 hours",
    "bus": "47-49 hours",
    "car": "39-41 hours"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

To test manually:
curl -X POST http://127.0.0.1:8000/api/travel/modes \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 461,
    "days": 3,
    "preferred_mode": "train"
  }'
"""