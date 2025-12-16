# routes/location_routes.py
"""
Module 1: Location Discovery & Validation (Cities Only)

SOLUTION B: Photon API (Compliant autocomplete alternative)
Photon is built on Nominatim data but ALLOWS autocomplete usage.
Hosted by Komoot, free, and fast.

Reference: https://photon.komoot.io/
"""

from fastapi import APIRouter, Query
import httpx
from typing import Dict

router = APIRouter()

# Photon API configuration (autocomplete-friendly)
PHOTON_BASE_URL = "https://photon.komoot.io/api"
TIMEOUT = 5.0


def normalize_location(raw_result: dict) -> Dict[str, any]:
    """
    Convert Photon response to our standard location format.
    """
    properties = raw_result.get("properties", {})
    geometry = raw_result.get("geometry", {})
    coordinates = geometry.get("coordinates", [0, 0])
    
    return {
        "name": properties.get("name", "Unknown"),
        "state": properties.get("state", "Unknown"),
        "country": properties.get("country", "India"),
        "lat": coordinates[1] if len(coordinates) > 1 else 0,
        "lon": coordinates[0] if len(coordinates) > 0 else 0
    }


@router.get("/api/locations/search")
async def search_locations(
    q: str = Query(..., min_length=2, description="Search query (min 2 characters)")
):
    """
    Search for Indian cities using Photon API (autocomplete-friendly)
    
    **Why Photon instead of Nominatim?**
    - Photon ALLOWS autocomplete (unlike Nominatim)
    - Based on OpenStreetMap data (same quality)
    - Free, fast, and maintained by Komoot
    - No registration required
    
    **Key differences from Nominatim:**
    - Returns GeoJSON format (we normalize it)
    - Designed for autocomplete use cases
    - No 1-second delay required between requests
    
    Args:
        q: City search query
    
    Returns:
        List of matching Indian cities
    """
    
    if len(q.strip()) < 2:
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                PHOTON_BASE_URL,
                params={
                    "q": q,
                    "limit": 10,
                    "osm_tag": "place:city",  # Cities only
                    "layer": "city",           # Additional city filter
                    "countrycode": "IN"        # India only (ISO code)
                },
                timeout=TIMEOUT
            )
            
            if response.status_code != 200:
                print(f"⚠️ Photon returned status {response.status_code}")
                return []
            
            data = response.json()
            features = data.get("features", [])
            
            # Normalize and filter
            normalized = []
            for feature in features[:7]:  # Limit to 7 results
                try:
                    city = normalize_location(feature)
                    # Additional validation
                    if city["name"] != "Unknown" and city["lat"] != 0:
                        normalized.append(city)
                except Exception as e:
                    print(f"⚠️ Error normalizing feature: {e}")
                    continue
            
            print(f"🔍 Search '{q}' → {len(normalized)} cities found")
            return normalized
            
    except httpx.TimeoutException:
        print(f"⏱️ Photon timeout for query: {q}")
        return []
        
    except Exception as e:
        print(f"🔥 Location search error: {e}")
        return []


@router.get("/api/locations/health")
async def location_health():
    """Check if Photon API is reachable"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                PHOTON_BASE_URL,
                params={"q": "Mumbai", "limit": 1, "countrycode": "IN"},
                timeout=3.0
            )
            return {
                "status": "ok" if response.status_code == 200 else "degraded",
                "api": "Photon (Komoot)",
                "photon_reachable": response.status_code == 200
            }
    except Exception as e:
        return {
            "status": "error", 
            "api": "Photon (Komoot)",
            "message": str(e)
        }