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
from typing import Optional, Union
from data.cities import get_city_by_name, validate_city_exists
from utils.distance import calculate_distance, calculate_minimum_days

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


class RouteValidationResponse(BaseModel):
    """Response containing feasibility analysis"""
    feasible: bool
    distance_km: int
    minimum_days: int
    source_city: Optional[str] = None
    destination_city: Optional[str] = None
    reason: Optional[str] = None


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
    
    **Validation logic:**
    - Calculates distance using Haversine formula
    - Applies India-specific feasibility rules
    - Returns minimum recommended days
    
    Args:
        request: Source/destination (cities or coordinates) and trip duration
    
    Returns:
        RouteValidationResponse with feasibility status
    
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
    # DISTANCE CALCULATION
    # ========================================================================
    
    distance_km = calculate_distance(source_lat, source_lon, dest_lat, dest_lon)
    
    # ========================================================================
    # FEASIBILITY CHECK
    # ========================================================================
    
    minimum_days = calculate_minimum_days(distance_km)
    feasible = request.days >= minimum_days
    
    # Generate reason if not feasible
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
        reason=reason
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
        "method": "haversine",
        "data_source": "data/cities.py",
        "input_modes": ["city_names", "raw_coordinates"],
        "rules": {
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
  "distance_km": 233,
  "minimum_days": 2,
  "source_city": "Delhi",
  "destination_city": "Agra",
  "reason": null
}

---

Example 2: Not feasible (city names)
POST /api/route/validate
{
  "source_city": "Delhi",
  "destination_city": "Bangalore",
  "days": 2
}
Response:
{
  "feasible": false,
  "distance_km": 2157,
  "minimum_days": 5,
  "source_city": "Delhi",
  "destination_city": "Bangalore",
  "reason": "Distance too long for selected trip duration. Recommended minimum is 5 days for a 2157km journey."
}

---

Example 3: Mumbai to Goa (popular route)
POST /api/route/validate
{
  "source_city": "Mumbai",
  "destination_city": "Goa",
  "days": 3
}
Response:
{
  "feasible": true,
  "distance_km": 461,
  "minimum_days": 3,
  "source_city": "Mumbai",
  "destination_city": "Goa",
  "reason": null
}

---

Example 4: GET endpoint (simplified)
GET /api/route/validate/Mumbai/Goa/3
Response: Same as POST example above

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
  "distance_km": 233,
  "minimum_days": 2,
  "source_city": null,
  "destination_city": null,
  "reason": null
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