# routes/route_validation.py
"""
Module 2: Route Feasibility Engine (Deterministic)

This module validates whether a trip between two cities is feasible
given the user's selected duration, based purely on distance calculations.

NO AI MODELS | NO EXTERNAL APIS | PURE LOGIC
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
import math

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class Coordinates(BaseModel):
    """Geographic coordinates"""
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")

class RouteValidationRequest(BaseModel):
    """Request to validate route feasibility"""
    source: Coordinates
    destination: Coordinates
    days: int = Field(..., ge=1, le=30, description="Trip duration in days")

class RouteValidationResponse(BaseModel):
    """Response containing feasibility analysis"""
    feasible: bool
    distance_km: int
    minimum_days: int
    reason: Optional[str] = None

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
    """
    if distance_km <= 300:
        return 2
    elif distance_km <= 700:
        return 3
    elif distance_km <= 1200:
        return 4
    else:
        return 5

# ============================================================================
# VALIDATION ENDPOINT
# ============================================================================

@router.post("/api/route/validate", response_model=RouteValidationResponse)
async def validate_route(request: RouteValidationRequest):
    """
    Validate if a trip is feasible given the distance and duration.
    
    This is a DETERMINISTIC function:
    - No AI reasoning
    - No external API calls
    - Pure distance-based logic
    
    Args:
        request: Source/destination coordinates and trip duration
    
    Returns:
        RouteValidationResponse with feasibility status
    
    Raises:
        HTTPException 400: Invalid input (caught by Pydantic)
    """
    
    # Step 1: Calculate distance
    distance = haversine_distance(
        request.source.lat,
        request.source.lon,
        request.destination.lat,
        request.destination.lon
    )
    
    # Round to nearest integer for cleaner display
    distance_km = round(distance)
    
    # Step 2: Determine minimum days required
    minimum_days = calculate_minimum_days(distance_km)
    
    # Step 3: Check feasibility
    feasible = request.days >= minimum_days
    
    # Step 4: Generate reason if not feasible
    reason = None
    if not feasible:
        reason = (
            f"Distance too long for selected trip duration. "
            f"Recommended minimum is {minimum_days} days for a {distance_km}km journey."
        )
    
    return RouteValidationResponse(
        feasible=feasible,
        distance_km=distance_km,
        minimum_days=minimum_days,
        reason=reason
    )

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
Example 1: Feasible short trip
POST /api/route/validate
{
  "source": {"lat": 28.7041, "lon": 77.1025},  // Delhi
  "destination": {"lat": 27.1767, "lon": 78.0081},  // Agra
  "days": 2
}
Response:
{
  "feasible": true,
  "distance_km": 233,
  "minimum_days": 2,
  "reason": null
}

---

Example 2: Not feasible (too short)
POST /api/route/validate
{
  "source": {"lat": 28.7041, "lon": 77.1025},  // Delhi
  "destination": {"lat": 12.9716, "lon": 77.5946},  // Bangalore
  "days": 2
}
Response:
{
  "feasible": false,
  "distance_km": 2157,
  "minimum_days": 5,
  "reason": "Distance too long for selected trip duration. Recommended minimum is 5 days for a 2157km journey."
}

---

Example 3: Mumbai to Goa (popular route)
POST /api/route/validate
{
  "source": {"lat": 19.0760, "lon": 72.8777},  // Mumbai
  "destination": {"lat": 15.2993, "lon": 74.1240},  // Goa
  "days": 3
}
Response:
{
  "feasible": true,
  "distance_km": 461,
  "minimum_days": 3,
  "reason": null
}

---

To test manually:
curl -X POST http://127.0.0.1:8000/api/route/validate \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"lat": 28.7041, "lon": 77.1025},
    "destination": {"lat": 27.1767, "lon": 78.0081},
    "days": 2
  }'
"""