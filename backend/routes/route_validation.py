# routes/route_validation.py
"""
Module 2: Route Feasibility Engine (Deterministic)

REFACTORED: Now integrates with centralized city database
- Validates city names against data/cities.py
- Automatically retrieves coordinates
- Supports both city names and raw coordinates
- Reuses distance calculation logic

NO AI MODELS | NO EXTERNAL APIS | PURE LOGIC
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Union, Dict
from data.cities import get_city_by_name, validate_city_exists
from utils.distance import calculate_estimated_road_distance, calculate_minimum_days
from utils.feasibility import evaluate_trip_feasibility, get_mode_comparison_table

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class Coordinates(BaseModel):
    """Geographic coordinates"""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")


class RouteValidationRequest(BaseModel):
    """
    Request to validate route feasibility
    
    Supports two input modes:
    1. City names (recommended): Validates against database
    2. Raw coordinates: For custom locations
    """
    # Option 1: City names (recommended)
    source_city: Optional[str] = Field(None, description="Source city name")
    destination_city: Optional[str] = Field(None, description="Destination city name")
    
    # Option 2: Raw coordinates (fallback)
    source: Optional[Coordinates] = Field(None, description="Source coordinates")
    destination: Optional[Coordinates] = Field(None, description="Destination coordinates")
    
    days: int = Field(..., ge=1, le=30, description="Trip duration in days")
    
    @field_validator('source_city', 'destination_city')
    @classmethod
    def validate_city_name(cls, v):
        """Trim whitespace from city names"""
        if v:
            return v.strip()
        return v


class ModeComparisonEntry(BaseModel):
    """Per-mode feasibility detail, used in the `mode_comparison` breakdown"""
    one_way_time: str
    round_trip_hours: float
    remaining_days: float
    status: str
    status_label: str
    notes: str


class RouteValidationResponse(BaseModel):
    """Response containing feasibility analysis"""
    # --- Original fields (UNCHANGED - existing clients keep working as-is) ---
    feasible: bool
    distance_km: int
    minimum_days: int
    source_city: Optional[str] = None
    destination_city: Optional[str] = None
    reason: Optional[str] = None

    # --- New, additive fields from the intelligent feasibility engine ---
    # These are all optional so any existing consumer that only reads the
    # fields above is completely unaffected.
    status: Optional[str] = Field(
        None, description="Rich trip status: ideal / feasible / possible_with_limited_time / not_recommended / not_possible"
    )
    status_label: Optional[str] = Field(None, description="Human-readable status label, e.g. 'Short but Manageable'")
    trip_rating: Optional[str] = Field(None, description="Short glanceable rating, e.g. 'Excellent', 'Great', 'Fair', 'Tight', 'Poor'")
    recommended_mode: Optional[str] = Field(None, description="Best overall travel mode for this route/duration")
    estimated_travel_time: Optional[str] = Field(None, description="One-way travel time for the recommended mode")
    remaining_time_days: Optional[float] = Field(None, description="Days left for sightseeing after round-trip travel (numeric, kept for compatibility)")
    remaining_time_text: Optional[str] = Field(None, description="Human-language description of remaining sightseeing time, e.g. 'You'll have around 2\u00bd days to explore your destination.'")
    message: Optional[str] = Field(None, description="Ready-to-display, human travel-planner-style recommendation paragraph")
    mode_comparison: Optional[Dict[str, ModeComparisonEntry]] = Field(
        None, description="Per-mode breakdown (flight/train/bus/car) for a travel-mode comparison UI"
    )


# ============================================================================
# VALIDATION ENDPOINT
# ============================================================================

@router.post("/api/route/validate", response_model=RouteValidationResponse)
async def validate_route(request: RouteValidationRequest):
    """
    Validate if a trip is feasible given the distance and duration.
    
    **NEW: Two input modes**
    1. City names (recommended):
       - Validates against city database
       - Auto-fetches coordinates
       - Returns city names in response
    
    2. Raw coordinates (fallback):
       - For custom/unlisted locations
       - Direct coordinate input
    
    **Validation logic (updated):**
    - Calculates straight-line distance via Haversine, then converts it to
      an estimated real-world ROAD distance using adaptive multipliers
      (`utils.distance.calculate_estimated_road_distance`). This is the
      distance used everywhere below and in the response.
    - Runs the mode-aware feasibility engine
      (`utils.feasibility.evaluate_trip_feasibility`), which checks every
      travel mode's one-way time, round-trip time, and remaining
      sightseeing time rather than comparing distance against a single
      fixed day threshold. This is what makes a route like a 3-day
      Delhi-Mumbai trip correctly come back feasible (by flight) instead
      of being rejected outright.
    - `minimum_days` is still returned for backward compatibility, but is
      now a secondary, simple reference figure -- `feasible` is driven by
      the richer engine, not by `days >= minimum_days`.
    
    Args:
        request: Source/destination (cities or coordinates) and trip duration
    
    Returns:
        RouteValidationResponse with feasibility status plus the richer
        status/recommended_mode/message fields
    
    Raises:
        HTTPException 400: Invalid input or city not found
    """
    
    source_lat = source_lon = dest_lat = dest_lon = None
    source_city_name = destination_city_name = None
    
    # ========================================================================
    # INPUT VALIDATION: City names OR coordinates must be provided
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
        
        # Get city data
        source_city = get_city_by_name(request.source_city)
        dest_city = get_city_by_name(request.destination_city)
        
        source_lat = source_city["lat"]
        source_lon = source_city["lon"]
        dest_lat = dest_city["lat"]
        dest_lon = dest_city["lon"]
        source_city_name = source_city["name"]
        destination_city_name = dest_city["name"]
    
    # Case 2: Raw coordinates provided (fallback)
    elif request.source and request.destination:
        source_lat = request.source.lat
        source_lon = request.source.lon
        dest_lat = request.destination.lat
        dest_lon = request.destination.lon
    
    # Case 3: Mixed or missing input - ERROR
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide either (source_city + destination_city) OR (source + destination coordinates). "
                   "Do not mix both formats."
        )
    
    # ========================================================================
    # DISTANCE CALCULATION (now realistic road-distance, not straight-line)
    # ========================================================================
    
    distance_km = calculate_estimated_road_distance(source_lat, source_lon, dest_lat, dest_lon)
    
    # ========================================================================
    # FEASIBILITY CHECK
    # ========================================================================
    
    # Legacy reference figure, kept for backward-compatible `minimum_days` field.
    minimum_days = calculate_minimum_days(distance_km)
    
    # Real feasibility now comes from the mode-aware engine: it checks
    # every travel mode's actual one-way/round-trip time against the trip
    # duration, instead of a single fixed distance-to-days threshold.
    trip_result = evaluate_trip_feasibility(distance_km, request.days)
    mode_comparison_raw = get_mode_comparison_table(distance_km, request.days)
    mode_comparison = {
        mode_name: ModeComparisonEntry(**details)
        for mode_name, details in mode_comparison_raw.items()
    }
    
    feasible = trip_result.feasible
    
    # `reason` keeps its original meaning (a short explanation for an
    # infeasible trip) so any existing UI that only reads `reason` when
    # `feasible` is false continues to behave the same way.
    reason = None
    if not feasible:
        reason = (
            f"Distance too long for selected trip duration. "
            f"Recommended minimum is {minimum_days} days for a {distance_km}km journey."
        )
    
    # ========================================================================
    # RESPONSE
    # ========================================================================
    
    return RouteValidationResponse(
        feasible=feasible,
        distance_km=distance_km,
        minimum_days=minimum_days,
        source_city=source_city_name,
        destination_city=destination_city_name,
        reason=reason,
        status=trip_result.status.value,
        status_label=trip_result.status_label,
        trip_rating=trip_result.trip_rating,
        recommended_mode=trip_result.recommended_mode.value,
        estimated_travel_time=trip_result.estimated_travel_time,
        remaining_time_days=trip_result.remaining_time_days,
        remaining_time_text=trip_result.remaining_time_text,
        message=trip_result.message,
        mode_comparison=mode_comparison,
    )


# ============================================================================
# CONVENIENCE ENDPOINT: Quick city-to-city validation
# ============================================================================

@router.get("/api/route/validate/{source_city}/{destination_city}/{days}")
async def validate_route_simple(
    source_city: str,
    destination_city: str,
    days: int
) -> RouteValidationResponse:
    """
    Simplified GET endpoint for quick route validation
    
    Example:
        GET /api/route/validate/Mumbai/Goa/3
    
    Args:
        source_city: Source city name
        destination_city: Destination city name
        days: Trip duration in days
    
    Returns:
        RouteValidationResponse
    """
    request = RouteValidationRequest(
        source_city=source_city,
        destination_city=destination_city,
        days=days
    )
    return await validate_route(request)


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/route/health")
async def route_health():
    """Health check for route validation service"""
    return {
        "status": "ok",
        "service": "route_feasibility",
        "method": "haversine_with_road_distance_estimation",
        "data_source": "data/cities.py",
        "input_modes": ["city_names", "raw_coordinates"],
        "distance_model": {
            "base": "haversine (straight-line)",
            "adjustment": "adaptive road-distance multiplier (1.18x-1.25x by distance band)",
        },
        "feasibility_model": "mode-aware (flight/train/bus/car one-way + round-trip time vs. trip duration)",
        "legacy_rules_for_minimum_days_field": {
            "0-300km": "2 days",
            "300-700km": "3 days",
            "700-1200km": "4 days",
            ">1200km": "5 days"
        }
    }


# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

"""
NEW USAGE EXAMPLES (City Names - Recommended)
==============================================

Example 1: Feasible short trip (city names)
POST /api/route/validate
{
  "source_city": "Delhi",
  "destination_city": "Agra",
  "days": 2
}
Response:
{
  "feasible": true,
  "distance_km": 234,
  "minimum_days": 2,
  "source_city": "Delhi",
  "destination_city": "Agra",
  "reason": null,
  "status": "ideal",
  "status_label": "Ideal",
  "recommended_mode": "train",
  "estimated_travel_time": "3h 36m",
  "remaining_time_days": 1.7,
  "message": "Recommended Mode: Train\nEstimated Travel Time: 3h 36m\nRemaining Time: 1.7 days\nTrip Status: Ideal\nRecommendation: Excellent choice — plenty of time to relax and explore.\nNote: Comfortable daytime journey.",
  "mode_comparison": { "...": "per-mode breakdown for flight/train/bus/car" }
}

Note: `distance_km` is now the estimated ROAD distance (not straight-line),
so it will typically read a bit higher than before.

---

Example 2: Previously "not feasible", now correctly feasible by flight
POST /api/route/validate
{
  "source_city": "Delhi",
  "destination_city": "Mumbai",
  "days": 3
}
Response:
{
  "feasible": true,
  "distance_km": 1418,
  "minimum_days": 5,
  "source_city": "Delhi",
  "destination_city": "Mumbai",
  "reason": null,
  "status": "ideal",
  "status_label": "Ideal",
  "recommended_mode": "flight",
  "estimated_travel_time": "5h 1m",
  "remaining_time_days": 2.6,
  "message": "Recommended Mode: Flight\nEstimated Travel Time: 5h 1m\nRemaining Time: 2.6 days\nTrip Status: Ideal\nRecommendation: Excellent choice — plenty of time to relax and explore.\nNote: Includes airport transfer, check-in, security and boarding time."
}

Note: `minimum_days` (5) is still reported as the legacy reference figure,
but `feasible` is now driven by the mode-aware engine, which correctly
recognizes this as flyable within 3 days.

---

Example 3: Genuinely too long even by flight
POST /api/route/validate
{
  "source_city": "Delhi",
  "destination_city": "Bangalore",
  "days": 1
}
Response:
{
  "feasible": false,
  "distance_km": 2100,
  "minimum_days": 5,
  "source_city": "Delhi",
  "destination_city": "Bangalore",
  "reason": "Distance too long for selected trip duration. Recommended minimum is 5 days for a 2100km journey.",
  "status": "not_possible",
  "status_label": "Not Possible",
  "recommended_mode": "flight",
  "estimated_travel_time": "6h",
  "remaining_time_days": 0.0,
  "message": "Recommended Mode: Flight\nEstimated Travel Time: 6h\nRemaining Time: 0.0 days\nTrip Status: Not Possible\nRecommendation: This route isn't realistically possible in the given duration, even by flight."
}

---

Example 4: GET endpoint (simplified)
GET /api/route/validate/Mumbai/Goa/3
Response: Same shape as the POST examples above

---

Example 5: Invalid city name
POST /api/route/validate
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

BACKWARD COMPATIBLE (Raw Coordinates)
======================================

Example 6: Raw coordinates (still works)
POST /api/route/validate
{
  "source": {"lat": 28.7041, "lon": 77.1025},
  "destination": {"lat": 27.1767, "lon": 78.0081},
  "days": 2
}
Response:
{
  "feasible": true,
  "distance_km": 234,
  "minimum_days": 2,
  "source_city": null,
  "destination_city": null,
  "reason": null,
  "status": "ideal",
  "status_label": "Ideal",
  "recommended_mode": "train",
  "estimated_travel_time": "3h 36m",
  "remaining_time_days": 1.7,
  "message": "..."
}

---

To test manually:
# City names (recommended)
curl -X POST http://127.0.0.1:8000/api/route/validate \
  -H "Content-Type: application/json" \
  -d '{
    "source_city": "Mumbai",
    "destination_city": "Goa",
    "days": 3
  }'

# GET endpoint
curl http://127.0.0.1:8000/api/route/validate/Mumbai/Goa/3

# Raw coordinates (backward compatible)
curl -X POST http://127.0.0.1:8000/api/route/validate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"lat": 28.7041, "lon": 77.1025},
    "destination": {"lat": 27.1767, "lon": 78.0081},
    "days": 2
  }'
"""