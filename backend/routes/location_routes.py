# routes/location_routes.py
"""
Module 1: Location Discovery & Validation (Cities Only)

SOLUTION A: Static City List (Recommended for compliance)
Since Nominatim forbids autocomplete, we use a pre-defined list of major Indian cities.
This is compliant, fast, and deterministic.

If you need dynamic geocoding, consider:
- Running your own Nominatim instance
- Using commercial APIs (Google Places, Mapbox, etc.)
- Using Photon API (allows autocomplete)
"""

from fastapi import APIRouter, Query
from typing import List, Dict
import json

router = APIRouter()

# Pre-defined list of major Indian cities with coordinates
# This approach is Nominatim-compliant and provides instant results
INDIAN_CITIES = [
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    {"name": "Delhi", "state": "Delhi", "lat": 28.7041, "lon": 77.1025},
    {"name": "Bangalore", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714},
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873},
    {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311},
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462},
    {"name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882},
    {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577},
    {"name": "Thane", "state": "Maharashtra", "lat": 19.2183, "lon": 72.9781},
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185},
    {"name": "Pimpri-Chinchwad", "state": "Maharashtra", "lat": 18.6298, "lon": 73.7997},
    {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376},
    {"name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "lat": 28.6692, "lon": 77.4538},
    {"name": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lon": 75.8573},
    {"name": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081},
    {"name": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898},
    {"name": "Faridabad", "state": "Haryana", "lat": 28.4089, "lon": 77.3178},
    {"name": "Meerut", "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064},
    {"name": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lon": 70.8022},
    {"name": "Kalyan-Dombivali", "state": "Maharashtra", "lat": 19.2403, "lon": 73.1305},
    {"name": "Vasai-Virar", "state": "Maharashtra", "lat": 19.4612, "lon": 72.7988},
    {"name": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739},
    {"name": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lon": 74.7973},
    {"name": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lon": 75.3433},
    {"name": "Dhanbad", "state": "Jharkhand", "lat": 23.7957, "lon": 86.4304},
    {"name": "Amritsar", "state": "Punjab", "lat": 31.6340, "lon": 74.8723},
    {"name": "Navi Mumbai", "state": "Maharashtra", "lat": 19.0330, "lon": 73.0297},
    {"name": "Allahabad", "state": "Uttar Pradesh", "lat": 25.4358, "lon": 81.8463},
    {"name": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lon": 85.3096},
    {"name": "Howrah", "state": "West Bengal", "lat": 22.5958, "lon": 88.2636},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lon": 79.9864},
    {"name": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lon": 80.6480},
    {"name": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243},
    {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198},
    {"name": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lon": 81.6296},
    {"name": "Kota", "state": "Rajasthan", "lat": 25.2138, "lon": 75.8648},
    {"name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794},
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362},
    {"name": "Solapur", "state": "Maharashtra", "lat": 17.6599, "lon": 75.9064},
    {"name": "Hubli-Dharwad", "state": "Karnataka", "lat": 15.3647, "lon": 75.1240},
    {"name": "Mysore", "state": "Karnataka", "lat": 12.2958, "lon": 76.6394},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "lat": 10.7905, "lon": 78.7047},
    {"name": "Bareilly", "state": "Uttar Pradesh", "lat": 28.3670, "lon": 79.4304},
    {"name": "Aligarh", "state": "Uttar Pradesh", "lat": 27.8974, "lon": 78.0880},
    {"name": "Tiruppur", "state": "Tamil Nadu", "lat": 11.1085, "lon": 77.3411},
    {"name": "Moradabad", "state": "Uttar Pradesh", "lat": 28.8389, "lon": 78.7378},
    {"name": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lon": 75.5762},
    {"name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245},
    {"name": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9689, "lon": 79.5941},
    {"name": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lon": 80.4365},
    {"name": "Bhiwandi", "state": "Maharashtra", "lat": 19.3009, "lon": 73.0643},
    {"name": "Saharanpur", "state": "Uttar Pradesh", "lat": 29.9680, "lon": 77.5460},
    {"name": "Gorakhpur", "state": "Uttar Pradesh", "lat": 26.7606, "lon": 83.3732},
    {"name": "Bikaner", "state": "Rajasthan", "lat": 28.0229, "lon": 73.3119},
    {"name": "Amravati", "state": "Maharashtra", "lat": 20.9333, "lon": 77.7500},
    {"name": "Noida", "state": "Uttar Pradesh", "lat": 28.5355, "lon": 77.3910},
    {"name": "Jamshedpur", "state": "Jharkhand", "lat": 22.8046, "lon": 86.2029},
    {"name": "Bhilai", "state": "Chhattisgarh", "lat": 21.2095, "lon": 81.4290},
    {"name": "Cuttack", "state": "Odisha", "lat": 20.4625, "lon": 85.8830},
    {"name": "Firozabad", "state": "Uttar Pradesh", "lat": 27.1592, "lon": 78.3957},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673},
    {"name": "Bhavnagar", "state": "Gujarat", "lat": 21.7645, "lon": 72.1519},
    {"name": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lon": 78.0322},
    {"name": "Durgapur", "state": "West Bengal", "lat": 23.5204, "lon": 87.3119},
    {"name": "Asansol", "state": "West Bengal", "lat": 23.6739, "lon": 86.9524},
    {"name": "Nanded", "state": "Maharashtra", "lat": 19.1383, "lon": 77.3210},
    {"name": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lon": 74.2433},
    {"name": "Ajmer", "state": "Rajasthan", "lat": 26.4499, "lon": 74.6399},
    {"name": "Gulbarga", "state": "Karnataka", "lat": 17.3297, "lon": 76.8343},
    {"name": "Jamnagar", "state": "Gujarat", "lat": 22.4707, "lon": 70.0577},
    {"name": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lon": 75.7885},
    {"name": "Loni", "state": "Uttar Pradesh", "lat": 28.7520, "lon": 77.2864},
    {"name": "Siliguri", "state": "West Bengal", "lat": 26.7271, "lon": 88.3953},
    {"name": "Jhansi", "state": "Uttar Pradesh", "lat": 25.4484, "lon": 78.5685},
    {"name": "Ulhasnagar", "state": "Maharashtra", "lat": 19.2183, "lon": 73.1382},
    {"name": "Jammu", "state": "Jammu and Kashmir", "lat": 32.7266, "lon": 74.8570},
    {"name": "Mangalore", "state": "Karnataka", "lat": 12.9141, "lon": 74.8560},
    {"name": "Erode", "state": "Tamil Nadu", "lat": 11.3410, "lon": 77.7172},
    {"name": "Belgaum", "state": "Karnataka", "lat": 15.8497, "lon": 74.4977},
    {"name": "Ambattur", "state": "Tamil Nadu", "lat": 13.0982, "lon": 80.1622},
    {"name": "Tirunelveli", "state": "Tamil Nadu", "lat": 8.7139, "lon": 77.7567},
    {"name": "Malegaon", "state": "Maharashtra", "lat": 20.5579, "lon": 74.5287},
    {"name": "Gaya", "state": "Bihar", "lat": 24.7955, "lon": 85.0002},
    {"name": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lon": 73.7125},
    {"name": "Maheshtala", "state": "West Bengal", "lat": 22.5094, "lon": 88.2475},
    {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366},
    {"name": "Goa", "state": "Goa", "lat": 15.2993, "lon": 74.1240},
    {"name": "Pondicherry", "state": "Puducherry", "lat": 11.9416, "lon": 79.8083},
    {"name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734},
    {"name": "Manali", "state": "Himachal Pradesh", "lat": 32.2396, "lon": 77.1887},
    {"name": "Darjeeling", "state": "West Bengal", "lat": 27.0410, "lon": 88.2663},
    {"name": "Ooty", "state": "Tamil Nadu", "lat": 11.4064, "lon": 76.6932},
    {"name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065},
    {"name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868},
    {"name": "Imphal", "state": "Manipur", "lat": 24.8170, "lon": 93.9368},
    {"name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933},
    {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lon": 92.7176},
    {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lon": 94.1086},
    {"name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053},
    {"name": "Port Blair", "state": "Andaman and Nicobar Islands", "lat": 11.6234, "lon": 92.7265},
]


@router.get("/api/locations/search")
async def search_locations(
    q: str = Query(..., min_length=2, description="Search query (min 2 characters)")
):
    """
    Search Indian cities from static list (Nominatim-compliant approach)
    
    **Why static list instead of live API?**
    - Nominatim EXPLICITLY FORBIDS autocomplete functionality
    - Static list is instant, reliable, and compliant
    - Covers all major tourist destinations in India
    - Provides accurate lat/lon for route calculations
    
    **For production with more cities:**
    Consider these Nominatim-compliant alternatives:
    1. Photon API (allows autocomplete): https://photon.komoot.io
    2. Run your own Nominatim instance
    3. Commercial APIs: Google Places, Mapbox, LocationIQ
    
    Args:
        q: City search query (case-insensitive)
    
    Returns:
        List of matching cities (max 7)
    """
    
    if len(q.strip()) < 2:
        return []
    
    query_lower = q.lower().strip()
    
    # Filter cities by name match (case-insensitive)
    matches = [
        {**city, "country": "India"}  # Add country for consistency
        for city in INDIAN_CITIES
        if query_lower in city["name"].lower()
    ]
    
    # Return max 7 results (consistent with original design)
    return matches[:7]


@router.get("/api/locations/health")
async def location_health():
    """Health check for location service"""
    return {
        "status": "ok",
        "method": "static_list",
        "total_cities": len(INDIAN_CITIES)
    }


# Optional: Get all cities (for debugging)
@router.get("/api/locations/all")
async def get_all_locations():
    """Get all available cities"""
    return {
        "cities": INDIAN_CITIES,
        "count": len(INDIAN_CITIES)
    }