# routes/travel_modes.py
"""
Module 3: Travel Mode, Distance & Time Engine (Deterministic)

REFACTORED: Now integrates with centralized city database
- Supports both city names and raw distance
- Validates cities against data/cities.py
- Calculates distance automatically from city names
- Reuses distance calculation logic

NO AI MODELS | NO EXTERNAL APIS | PURE LOGIC
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict
from enum import Enum
from data.cities import get_city_by_name, validate_city_exists
from utils.distance import calculate_distance
from utils.travel_time import (
    calculate_travel_time,
    format_travel_time,
    TravelMode,
    SPEED_CONFIG
)

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class TravelModeRequest(BaseModel):
    """
    Request for travel mode recommendations
    
    Supports two input modes:
    1. City names (recommended): Auto-calculates distance
    2. Raw distance: For pre-calculated distances
    """
    # Option 1: City names (recommended)
    source_city: Optional[str] = Field(None, description="Source city name")
    destination_city: Optional[str] = Field(None, description="Destination city name")
    
    # Option 2: Raw distance (fallback)
    distance_km: Optional[int] = Field(None, ge=1, le=5000, description="Distance in kilometers")
    
    days: int = Field(..., ge=1, le=30, description="Trip duration in days")
    preferred_mode: Optional[TravelMode] = Field(None, description="User's preferred travel mode")
    
    @field_validator('source_city', 'destination_city')
    @classmethod
    def validate_city_name(cls, v):
        """Trim whitespace from city names"""
        if v:
            return v.strip()
        return v


class TravelModeResponse(BaseModel):
    """Response with travel mode recommendations and validation"""
    distance_km: int
    source_city: Optional[str] = None
    destination_city: Optional[str] = None
    recommended_modes: List[str]
    estimated_times: Dict[str, str]
    preferred_mode_valid: bool
    preferred_mode_reason: Optional[str] = None


# ============================================================================
# MODE RECOMMENDATION LOGIC
# ============================================================================

def get_recommended_modes(distance_km: int) -> List[TravelMode]:
    """
    Recommend travel modes based on distance.
    
    Distance-based logic (India-specific):
    - Short (≤ 300 km): Car, Bus
      Example: Delhi-Agra (230km), Mumbai-Pune (150km)
    
    - Medium (300–700 km): Train, Bus
      Example: Mumbai-Goa (580km), Delhi-Jaipur (280km)
    
    - Long (700–1200 km): Train, Flight
      Example: Delhi-Mumbai (1400km), Bangalore-Hyderabad (575km)
    
    - Very Long (> 1200 km): Flight (primary), Train (secondary)
      Example: Delhi-Bangalore (2150km), Mumbai-Kolkata (2000km)
    
    Args:
        distance_km: Distance in kilometers
    
    Returns:
        List of recommended travel modes (ordered by preference)
    """
    if distance_km <= 300:
        return [TravelMode.CAR, TravelMode.BUS]
    elif distance_km <= 700:
        return [TravelMode.TRAIN, TravelMode.BUS]
    elif distance_km <= 1200:
        return [TravelMode.TRAIN, TravelMode.FLIGHT]
    else:
        return [TravelMode.FLIGHT, TravelMode.TRAIN]


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
    
    return (True, None)


# ============================================================================
# MAIN ENDPOINT
# ============================================================================

@router.post("/api/travel/modes", response_model=TravelModeResponse)
async def get_travel_modes(request: TravelModeRequest):
    """
    Get travel mode recommendations and validate preferred mode.
    
    **NEW: Two input modes**
    1. City names (recommended):
       - Validates against city database
       - Auto-calculates distance
       - Returns city names in response
    
    2. Raw distance (fallback):
       - For pre-calculated distances
       - Direct distance input
    
    **Logic flow:**
    - Calculate/use distance
    - Get distance-appropriate travel mode recommendations
    - Calculate estimated times for all modes
    - Validate user's preferred mode (if provided)
    
    Args:
        request: TravelModeRequest with cities/distance, days, and optional preferred mode
    
    Returns:
        TravelModeResponse with recommendations and validation
    """
    
    distance_km = None
    source_city_name = destination_city_name = None
    
    # ========================================================================
    # INPUT VALIDATION: City names OR distance must be provided
    # ========================================================================
    
    # Case 1: City names provided (recommended path)
    if request.source_city and request.destination_city:
        # Validate source city
        if not validate_city_exists(request.source_city):
            raise HTTPException(
                status_code=400,
                detail=f"Source city '{request.source_city}' not found in database. "
                       "Please use /api/locations/search to find valid cities."
            )
        
        # Validate destination city
        if not validate_city_exists(request.destination_city):
            raise HTTPException(
                status_code=400,
                detail=f"Destination city '{request.destination_city}' not found in database. "
                       "Please use /api/locations/search to find valid cities."
            )
        
        # Get city data and calculate distance
        source_city = get_city_by_name(request.source_city)
        dest_city = get_city_by_name(request.destination_city)
        
        distance_km = calculate_distance(
            source_city["lat"], source_city["lon"],
            dest_city["lat"], dest_city["lon"]
        )
        
        source_city_name = source_city["name"]
        destination_city_name = dest_city["name"]
    
    # Case 2: Raw distance provided (fallback)
    elif request.distance_km:
        distance_km = request.distance_km
    
    # Case 3: Neither provided - ERROR
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either (source_city + destination_city) OR distance_km. "
                   "Do not mix both formats."
        )
    
    # ========================================================================
    # TRAVEL MODE RECOMMENDATIONS
    # ========================================================================
    
    # Get distance-based recommendations
    recommended_modes = get_recommended_modes(distance_km)
    
    # Calculate estimated times for ALL modes (for comparison)
    estimated_times = {}
    for mode in TravelMode:
        travel_time = calculate_travel_time(distance_km, mode)
        estimated_times[mode.value] = format_travel_time(travel_time)
    
    # ========================================================================
    # VALIDATE PREFERRED MODE (if provided)
    # ========================================================================
    
    preferred_mode_valid = True
    preferred_mode_reason = None
    
    if request.preferred_mode is not None:
        preferred_mode_valid, preferred_mode_reason = validate_preferred_mode(
            distance_km,
            request.days,
            request.preferred_mode,
            recommended_modes
        )
    
    # ========================================================================
    # RESPONSE
    # ========================================================================
    
    return TravelModeResponse(
        distance_km=distance_km,
        source_city=source_city_name,
        destination_city=destination_city_name,
        recommended_modes=[mode.value for mode in recommended_modes],
        estimated_times=estimated_times,
        preferred_mode_valid=preferred_mode_valid,
        preferred_mode_reason=preferred_mode_reason
    )


# ============================================================================
# CONVENIENCE ENDPOINT: Quick city-to-city travel modes
# ============================================================================

@router.get("/api/travel/modes/{source_city}/{destination_city}/{days}")
async def get_travel_modes_simple(
    source_city: str,
    destination_city: str,
    days: int,
    preferred_mode: Optional[TravelMode] = None
) -> TravelModeResponse:
    """
    Simplified GET endpoint for quick travel mode lookup
    
    Example:
        GET /api/travel/modes/Mumbai/Goa/3
        GET /api/travel/modes/Mumbai/Goa/3?preferred_mode=train
    
    Args:
        source_city: Source city name
        destination_city: Destination city name
        days: Trip duration in days
        preferred_mode: Optional preferred travel mode
    
    Returns:
        TravelModeResponse
    """
    request = TravelModeRequest(
        source_city=source_city,
        destination_city=destination_city,
        days=days,
        preferred_mode=preferred_mode
    )
    return await get_travel_modes(request)


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/travel/health")
async def travel_health():
    """Health check for travel mode service"""
    return {
        "status": "ok",
        "service": "travel_modes",
        "data_source": "data/cities.py",
        "input_modes": ["city_names", "raw_distance"],
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
NEW USAGE EXAMPLES (City Names - Recommended)
==============================================

Example 1: Short trip - Delhi to Agra (city names)
POST /api/travel/modes
{
  "source_city": "Delhi",
  "destination_city": "Agra",
  "days": 2
}
Response:
{
  "distance_km": 233,
  "source_city": "Delhi",
  "destination_city": "Agra",
  "recommended_modes": ["car", "bus"],
  "estimated_times": {
    "flight": "3h 20m",
    "train": "3h 35m",
    "bus": "5h 10m",
    "car": "4h 14m"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

Example 2: Medium trip - Mumbai to Goa with preference
POST /api/travel/modes
{
  "source_city": "Mumbai",
  "destination_city": "Goa",
  "days": 3,
  "preferred_mode": "train"
}
Response:
{
  "distance_km": 461,
  "source_city": "Mumbai",
  "destination_city": "Goa",
  "recommended_modes": ["train", "bus"],
  "estimated_times": {
    "flight": "3h 39m",
    "train": "7h 5m",
    "bus": "10h 14m",
    "car": "8h 23m"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

Example 3: GET endpoint (simplified)
GET /api/travel/modes/Mumbai/Goa/3?preferred_mode=train
Response: Same as POST example above

---

Example 4: Invalid city name
POST /api/travel/modes
{
  "source_city": "InvalidCity",
  "destination_city": "Goa",
  "days": 3
}
Response: 400 Bad Request
{
  "detail": "Source city 'InvalidCity' not found in database. Please use /api/locations/search to find valid cities."
}

---

Example 5: Long trip - Invalid preferred mode
POST /api/travel/modes
{
  "source_city": "Delhi",
  "destination_city": "Bangalore",
  "days": 3,
  "preferred_mode": "train"
}
Response:
{
  "distance_km": 2157,
  "source_city": "Delhi",
  "destination_city": "Bangalore",
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

BACKWARD COMPATIBLE (Raw Distance)
===================================

Example 6: Raw distance (still works)
POST /api/travel/modes
{
  "distance_km": 461,
  "days": 3,
  "preferred_mode": "train"
}
Response:
{
  "distance_km": 461,
  "source_city": null,
  "destination_city": null,
  "recommended_modes": ["train", "bus"],
  "estimated_times": {
    "flight": "3h 39m",
    "train": "7h 5m",
    "bus": "10h 14m",
    "car": "8h 23m"
  },
  "preferred_mode_valid": true,
  "preferred_mode_reason": null
}

---

To test manually:
# City names (recommended)
curl -X POST http://127.0.0.1:8000/api/travel/modes \
  -H "Content-Type: application/json" \
  -d '{
    "source_city": "Mumbai",
    "destination_city": "Goa",
    "days": 3,
    "preferred_mode": "train"
  }'

# GET endpoint
curl "http://127.0.0.1:8000/api/travel/modes/Mumbai/Goa/3?preferred_mode=train"

# Raw distance (backward compatible)
curl -X POST http://127.0.0.1:8000/api/travel/modes \
  -H "Content-Type: application/json" \
  -d '{
    "distance_km": 461,
    "days": 3,
    "preferred_mode": "train"
  }'
"""