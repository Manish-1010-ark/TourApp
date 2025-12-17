# routes/location_routes.py
"""
Module 1: Location Discovery & Validation (Cities Only)

REFACTORED: Now uses shared city data layer
- City data centralized in data/cities.py
- Fast in-memory lookup
- Reusable across modules
- Easy to maintain and extend

COMPLIANCE NOTE:
Static city list approach remains compliant with Nominatim ToS.
For dynamic geocoding, consider:
- Running your own Nominatim instance
- Commercial APIs (Google Places, Mapbox, etc.)
- Photon API (allows autocomplete)
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict
from data.cities import (
    search_cities,
    get_city_by_name,
    get_stats,
    validate_city_exists,
    INDIAN_CITIES
)

router = APIRouter()


@router.get("/api/locations/search")
async def search_locations(
    q: str = Query(..., min_length=2, description="Search query (min 2 characters)")
) -> List[Dict]:
    """
    Search Indian cities from static database
    
    **Refactored Design:**
    - Uses centralized city data from data/cities.py
    - Same compliance approach (static list, no live API)
    - Enhanced dataset: Tier 1, Tier 2, and tourist destinations
    - Fast in-memory search
    
    **Why static list?**
    - Nominatim EXPLICITLY FORBIDS autocomplete functionality
    - Instant response, no API latency
    - Reliable and deterministic
    - Covers all major destinations in India
    
    Args:
        q: City search query (case-insensitive)
    
    Returns:
        List of matching cities (max 7)
    
    Example:
        GET /api/locations/search?q=Mum
        Returns: Mumbai, Munnar, etc.
    """
    
    if len(q.strip()) < 2:
        return []
    
    # Use centralized search function
    results = search_cities(q, limit=7)
    
    return results


@router.get("/api/locations/validate")
async def validate_location(
    city: str = Query(..., description="City name to validate")
) -> Dict:
    """
    Validate if a city exists in our database
    
    Useful for:
    - Route validation before calculation
    - Form validation
    - Data cleanup
    
    Args:
        city: City name to check
    
    Returns:
        Validation result with city details if found
    
    Example:
        GET /api/locations/validate?city=Mumbai
        Returns: {"valid": true, "city": {...}}
    """
    city_data = get_city_by_name(city)
    
    if city_data:
        return {
            "valid": True,
            "city": city_data
        }
    else:
        return {
            "valid": False,
            "message": f"City '{city}' not found in database",
            "suggestion": "Try searching for similar city names"
        }


@router.get("/api/locations/details/{city_name}")
async def get_city_details(city_name: str) -> Dict:
    """
    Get detailed information about a specific city
    
    Args:
        city_name: Name of the city
    
    Returns:
        City details including coordinates, state, tier
    
    Raises:
        404: City not found
    
    Example:
        GET /api/locations/details/Mumbai
    """
    city = get_city_by_name(city_name)
    
    if not city:
        raise HTTPException(
            status_code=404,
            detail=f"City '{city_name}' not found"
        )
    
    return city


@router.get("/api/locations/stats")
async def get_location_stats() -> Dict:
    """
    Get statistics about the city database
    
    Returns:
        Database stats: total cities, tier breakdown, coverage
    
    Example:
        GET /api/locations/stats
    """
    return {
        "status": "ok",
        "method": "static_database",
        **get_stats()
    }


@router.get("/api/locations/health")
async def location_health() -> Dict:
    """
    Health check for location service
    
    Returns:
        Service health status
    """
    stats = get_stats()
    return {
        "status": "ok",
        "service": "location_discovery",
        "method": "static_database",
        "data_source": "data/cities.py",
        "total_cities": stats["total_cities"],
        "ready": True
    }


# === OPTIONAL DEBUG ENDPOINTS ===
# Remove these in production or protect with authentication

@router.get("/api/locations/all")
async def get_all_locations() -> Dict:
    """
    Get all available cities (debug endpoint)
    
    **Note:** Consider paginating this in production
    """
    return {
        "cities": INDIAN_CITIES,
        "count": len(INDIAN_CITIES),
        "stats": get_stats()
    }