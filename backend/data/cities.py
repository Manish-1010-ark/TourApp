"""
Indian Cities Database - Shared Data Layer
===========================================

Comprehensive list of Indian cities including:
- Tier 1 cities (metros)
- Tier 2 cities (major urban centers)
- Popular tourist destinations
- State capitals

This module provides in-memory city data for:
- Location autocomplete
- Route validation
- Distance calculations
- Analytics and logging

Usage:
    from data.cities import INDIAN_CITIES, get_city_by_name, search_cities
    
    # Get all cities
    all_cities = INDIAN_CITIES
    
    # Search by name
    results = search_cities("Mumbai")
    
    # Get specific city
    city = get_city_by_name("Delhi")
"""

from typing import List, Dict, Optional

# Complete Indian Cities Dataset
INDIAN_CITIES = [
    # === TIER 1 CITIES (Metropolitan) ===
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "tier": 1, "country": "India"},
    {"name": "Delhi", "state": "Delhi", "lat": 28.7041, "lon": 77.1025, "tier": 1, "country": "India"},
    {"name": "Bangalore", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "tier": 1, "country": "India"},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "tier": 1, "country": "India"},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "tier": 1, "country": "India"},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "tier": 1, "country": "India"},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "tier": 1, "country": "India"},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "tier": 1, "country": "India"},
    
    # === TIER 2 CITIES (Major Urban Centers) ===
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "tier": 2, "country": "India"},
    {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311, "tier": 2, "country": "India"},
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "tier": 2, "country": "India"},
    {"name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lon": 80.3319, "tier": 2, "country": "India"},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "tier": 2, "country": "India"},
    {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lon": 75.8577, "tier": 2, "country": "India"},
    {"name": "Thane", "state": "Maharashtra", "lat": 19.2183, "lon": 72.9781, "tier": 2, "country": "India"},
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lon": 77.4126, "tier": 2, "country": "India"},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "tier": 2, "country": "India"},
    {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376, "tier": 2, "country": "India"},
    {"name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lon": 73.1812, "tier": 2, "country": "India"},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "lat": 28.6692, "lon": 77.4538, "tier": 2, "country": "India"},
    {"name": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lon": 75.8573, "tier": 2, "country": "India"},
    {"name": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lon": 78.0081, "tier": 2, "country": "India"},
    {"name": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lon": 73.7898, "tier": 2, "country": "India"},
    {"name": "Faridabad", "state": "Haryana", "lat": 28.4089, "lon": 77.3178, "tier": 2, "country": "India"},
    {"name": "Meerut", "state": "Uttar Pradesh", "lat": 28.9845, "lon": 77.7064, "tier": 2, "country": "India"},
    {"name": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lon": 70.8022, "tier": 2, "country": "India"},
    {"name": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lon": 82.9739, "tier": 2, "country": "India"},
    {"name": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lon": 74.7973, "tier": 2, "country": "India"},
    {"name": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lon": 75.3433, "tier": 2, "country": "India"},
    {"name": "Dhanbad", "state": "Jharkhand", "lat": 23.7957, "lon": 86.4304, "tier": 2, "country": "India"},
    {"name": "Amritsar", "state": "Punjab", "lat": 31.6340, "lon": 74.8723, "tier": 2, "country": "India"},
    {"name": "Navi Mumbai", "state": "Maharashtra", "lat": 19.0330, "lon": 73.0297, "tier": 2, "country": "India"},
    {"name": "Prayagraj", "state": "Uttar Pradesh", "lat": 25.4358, "lon": 81.8463, "tier": 2, "country": "India"},
    {"name": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lon": 85.3096, "tier": 2, "country": "India"},
    {"name": "Howrah", "state": "West Bengal", "lat": 22.5958, "lon": 88.2636, "tier": 2, "country": "India"},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lon": 76.9558, "tier": 2, "country": "India"},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lon": 79.9864, "tier": 2, "country": "India"},
    {"name": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lon": 78.1828, "tier": 2, "country": "India"},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lon": 80.6480, "tier": 2, "country": "India"},
    {"name": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lon": 73.0243, "tier": 2, "country": "India"},
    {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lon": 78.1198, "tier": 2, "country": "India"},
    {"name": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lon": 81.6296, "tier": 2, "country": "India"},
    {"name": "Kota", "state": "Rajasthan", "lat": 25.2138, "lon": 75.8648, "tier": 2, "country": "India"},
    {"name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lon": 76.7794, "tier": 2, "country": "India"},
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "tier": 2, "country": "India"},
    {"name": "Solapur", "state": "Maharashtra", "lat": 17.6599, "lon": 75.9064, "tier": 2, "country": "India"},
    {"name": "Mysore", "state": "Karnataka", "lat": 12.2958, "lon": 76.6394, "tier": 2, "country": "India"},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "lat": 10.7905, "lon": 78.7047, "tier": 2, "country": "India"},
    {"name": "Bareilly", "state": "Uttar Pradesh", "lat": 28.3670, "lon": 79.4304, "tier": 2, "country": "India"},
    {"name": "Aligarh", "state": "Uttar Pradesh", "lat": 27.8974, "lon": 78.0880, "tier": 2, "country": "India"},
    {"name": "Tiruppur", "state": "Tamil Nadu", "lat": 11.1085, "lon": 77.3411, "tier": 2, "country": "India"},
    {"name": "Moradabad", "state": "Uttar Pradesh", "lat": 28.8389, "lon": 78.7378, "tier": 2, "country": "India"},
    {"name": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lon": 75.5762, "tier": 2, "country": "India"},
    {"name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245, "tier": 2, "country": "India"},
    {"name": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lon": 78.1460, "tier": 2, "country": "India"},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9689, "lon": 79.5941, "tier": 2, "country": "India"},
    {"name": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lon": 80.4365, "tier": 2, "country": "India"},
    {"name": "Bhiwandi", "state": "Maharashtra", "lat": 19.3009, "lon": 73.0643, "tier": 2, "country": "India"},
    {"name": "Saharanpur", "state": "Uttar Pradesh", "lat": 29.9680, "lon": 77.5460, "tier": 2, "country": "India"},
    {"name": "Gorakhpur", "state": "Uttar Pradesh", "lat": 26.7606, "lon": 83.3732, "tier": 2, "country": "India"},
    {"name": "Bikaner", "state": "Rajasthan", "lat": 28.0229, "lon": 73.3119, "tier": 2, "country": "India"},
    {"name": "Amravati", "state": "Maharashtra", "lat": 20.9333, "lon": 77.7500, "tier": 2, "country": "India"},
    {"name": "Noida", "state": "Uttar Pradesh", "lat": 28.5355, "lon": 77.3910, "tier": 2, "country": "India"},
    {"name": "Jamshedpur", "state": "Jharkhand", "lat": 22.8046, "lon": 86.2029, "tier": 2, "country": "India"},
    {"name": "Bhilai", "state": "Chhattisgarh", "lat": 21.2095, "lon": 81.4290, "tier": 2, "country": "India"},
    {"name": "Cuttack", "state": "Odisha", "lat": 20.4625, "lon": 85.8830, "tier": 2, "country": "India"},
    {"name": "Firozabad", "state": "Uttar Pradesh", "lat": 27.1592, "lon": 78.3957, "tier": 2, "country": "India"},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "tier": 2, "country": "India"},
    {"name": "Bhavnagar", "state": "Gujarat", "lat": 21.7645, "lon": 72.1519, "tier": 2, "country": "India"},
    {"name": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lon": 78.0322, "tier": 2, "country": "India"},
    {"name": "Durgapur", "state": "West Bengal", "lat": 23.5204, "lon": 87.3119, "tier": 2, "country": "India"},
    {"name": "Asansol", "state": "West Bengal", "lat": 23.6739, "lon": 86.9524, "tier": 2, "country": "India"},
    {"name": "Nanded", "state": "Maharashtra", "lat": 19.1383, "lon": 77.3210, "tier": 2, "country": "India"},
    {"name": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lon": 74.2433, "tier": 2, "country": "India"},
    {"name": "Ajmer", "state": "Rajasthan", "lat": 26.4499, "lon": 74.6399, "tier": 2, "country": "India"},
    {"name": "Gulbarga", "state": "Karnataka", "lat": 17.3297, "lon": 76.8343, "tier": 2, "country": "India"},
    {"name": "Jamnagar", "state": "Gujarat", "lat": 22.4707, "lon": 70.0577, "tier": 2, "country": "India"},
    {"name": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lon": 75.7885, "tier": 2, "country": "India"},
    {"name": "Siliguri", "state": "West Bengal", "lat": 26.7271, "lon": 88.3953, "tier": 2, "country": "India"},
    {"name": "Jhansi", "state": "Uttar Pradesh", "lat": 25.4484, "lon": 78.5685, "tier": 2, "country": "India"},
    {"name": "Jammu", "state": "Jammu and Kashmir", "lat": 32.7266, "lon": 74.8570, "tier": 2, "country": "India"},
    {"name": "Mangalore", "state": "Karnataka", "lat": 12.9141, "lon": 74.8560, "tier": 2, "country": "India"},
    {"name": "Erode", "state": "Tamil Nadu", "lat": 11.3410, "lon": 77.7172, "tier": 2, "country": "India"},
    {"name": "Belgaum", "state": "Karnataka", "lat": 15.8497, "lon": 74.4977, "tier": 2, "country": "India"},
    {"name": "Tirunelveli", "state": "Tamil Nadu", "lat": 8.7139, "lon": 77.7567, "tier": 2, "country": "India"},
    {"name": "Gaya", "state": "Bihar", "lat": 24.7955, "lon": 85.0002, "tier": 2, "country": "India"},
    {"name": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lon": 73.7125, "tier": 2, "country": "India"},
    {"name": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lon": 76.9366, "tier": 2, "country": "India"},
    
    # === TOURIST DESTINATIONS ===
    {"name": "Goa", "state": "Goa", "lat": 15.2993, "lon": 74.1240, "tier": 2, "country": "India", "tourist": True},
    {"name": "Pondicherry", "state": "Puducherry", "lat": 11.9416, "lon": 79.8083, "tier": 2, "country": "India", "tourist": True},
    {"name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "tier": 2, "country": "India", "tourist": True},
    {"name": "Manali", "state": "Himachal Pradesh", "lat": 32.2396, "lon": 77.1887, "tier": 2, "country": "India", "tourist": True},
    {"name": "Darjeeling", "state": "West Bengal", "lat": 27.0410, "lon": 88.2663, "tier": 2, "country": "India", "tourist": True},
    {"name": "Ooty", "state": "Tamil Nadu", "lat": 11.4064, "lon": 76.6932, "tier": 2, "country": "India", "tourist": True},
    {"name": "Gangtok", "state": "Sikkim", "lat": 27.3389, "lon": 88.6065, "tier": 2, "country": "India", "tourist": True},
    {"name": "Rishikesh", "state": "Uttarakhand", "lat": 30.0869, "lon": 78.2676, "tier": 2, "country": "India", "tourist": True},
    {"name": "Haridwar", "state": "Uttarakhand", "lat": 29.9457, "lon": 78.1642, "tier": 2, "country": "India", "tourist": True},
    {"name": "Mussoorie", "state": "Uttarakhand", "lat": 30.4598, "lon": 78.0644, "tier": 2, "country": "India", "tourist": True},
    {"name": "Nainital", "state": "Uttarakhand", "lat": 29.3803, "lon": 79.4636, "tier": 2, "country": "India", "tourist": True},
    {"name": "Mount Abu", "state": "Rajasthan", "lat": 24.5926, "lon": 72.7156, "tier": 2, "country": "India", "tourist": True},
    {"name": "Kodaikanal", "state": "Tamil Nadu", "lat": 10.2381, "lon": 77.4892, "tier": 2, "country": "India", "tourist": True},
    {"name": "Munnar", "state": "Kerala", "lat": 10.0889, "lon": 77.0595, "tier": 2, "country": "India", "tourist": True},
    {"name": "Alleppey", "state": "Kerala", "lat": 9.4981, "lon": 76.3388, "tier": 2, "country": "India", "tourist": True},
    {"name": "Kovalam", "state": "Kerala", "lat": 8.4004, "lon": 76.9788, "tier": 2, "country": "India", "tourist": True},
    {"name": "Leh", "state": "Ladakh", "lat": 34.1526, "lon": 77.5771, "tier": 2, "country": "India", "tourist": True},
    {"name": "Ladakh", "state": "Ladakh", "lat": 34.1526, "lon": 77.5771, "tier": 2, "country": "India", "tourist": True},
    {"name": "Khajuraho", "state": "Madhya Pradesh", "lat": 24.8318, "lon": 79.9199, "tier": 2, "country": "India", "tourist": True},
    {"name": "Hampi", "state": "Karnataka", "lat": 15.3350, "lon": 76.4600, "tier": 2, "country": "India", "tourist": True},
    {"name": "Mahabalipuram", "state": "Tamil Nadu", "lat": 12.6269, "lon": 80.1932, "tier": 2, "country": "India", "tourist": True},
    {"name": "Rameswaram", "state": "Tamil Nadu", "lat": 9.2876, "lon": 79.3129, "tier": 2, "country": "India", "tourist": True},
    {"name": "Puri", "state": "Odisha", "lat": 19.8135, "lon": 85.8312, "tier": 2, "country": "India", "tourist": True},
    {"name": "Konark", "state": "Odisha", "lat": 19.8876, "lon": 86.0945, "tier": 2, "country": "India", "tourist": True},
    {"name": "Dwarka", "state": "Gujarat", "lat": 22.2442, "lon": 68.9685, "tier": 2, "country": "India", "tourist": True},
    {"name": "Somnath", "state": "Gujarat", "lat": 20.8880, "lon": 70.4013, "tier": 2, "country": "India", "tourist": True},
    {"name": "Pushkar", "state": "Rajasthan", "lat": 26.4899, "lon": 74.5511, "tier": 2, "country": "India", "tourist": True},
    {"name": "Jaisalmer", "state": "Rajasthan", "lat": 26.9157, "lon": 70.9083, "tier": 2, "country": "India", "tourist": True},
    {"name": "Andaman Islands", "state": "Andaman and Nicobar Islands", "lat": 11.6234, "lon": 92.7265, "tier": 2, "country": "India", "tourist": True},
    {"name": "Port Blair", "state": "Andaman and Nicobar Islands", "lat": 11.6234, "lon": 92.7265, "tier": 2, "country": "India", "tourist": True},
    {"name": "Havelock Island", "state": "Andaman and Nicobar Islands", "lat": 11.9934, "lon": 93.0094, "tier": 2, "country": "India", "tourist": True},
    {"name": "Coorg", "state": "Karnataka", "lat": 12.4244, "lon": 75.7382, "tier": 2, "country": "India", "tourist": True},
    {"name": "Wayanad", "state": "Kerala", "lat": 11.6854, "lon": 76.1320, "tier": 2, "country": "India", "tourist": True},
    {"name": "Gokarna", "state": "Karnataka", "lat": 14.5479, "lon": 74.3188, "tier": 2, "country": "India", "tourist": True},
    {"name": "Kasol", "state": "Himachal Pradesh", "lat": 32.0107, "lon": 77.3146, "tier": 2, "country": "India", "tourist": True},
    {"name": "McLeod Ganj", "state": "Himachal Pradesh", "lat": 32.2396, "lon": 76.3206, "tier": 2, "country": "India", "tourist": True},
    {"name": "Dharamshala", "state": "Himachal Pradesh", "lat": 32.2190, "lon": 76.3234, "tier": 2, "country": "India", "tourist": True},
    
    # === STATE CAPITALS (not already included) ===
    {"name": "Agartala", "state": "Tripura", "lat": 23.8315, "lon": 91.2868, "tier": 2, "country": "India"},
    {"name": "Imphal", "state": "Manipur", "lat": 24.8170, "lon": 93.9368, "tier": 2, "country": "India"},
    {"name": "Shillong", "state": "Meghalaya", "lat": 25.5788, "lon": 91.8933, "tier": 2, "country": "India"},
    {"name": "Aizawl", "state": "Mizoram", "lat": 23.7271, "lon": 92.7176, "tier": 2, "country": "India"},
    {"name": "Kohima", "state": "Nagaland", "lat": 25.6751, "lon": 94.1086, "tier": 2, "country": "India"},
    {"name": "Itanagar", "state": "Arunachal Pradesh", "lat": 27.0844, "lon": 93.6053, "tier": 2, "country": "India"},
    {"name": "Dispur", "state": "Assam", "lat": 26.1433, "lon": 91.7898, "tier": 2, "country": "India"},
    {"name": "Panaji", "state": "Goa", "lat": 15.4909, "lon": 73.8278, "tier": 2, "country": "India"},
]


# === UTILITY FUNCTIONS ===

def search_cities(query: str, limit: int = 7) -> List[Dict]:
    """
    Search cities by name (case-insensitive)
    
    Args:
        query: Search term
        limit: Maximum results to return
        
    Returns:
        List of matching cities
    """
    if len(query.strip()) < 2:
        return []
    
    query_lower = query.lower().strip()
    matches = [
        city for city in INDIAN_CITIES
        if query_lower in city["name"].lower()
    ]
    return matches[:limit]


def get_city_by_name(name: str) -> Optional[Dict]:
    """
    Get exact city by name (case-insensitive)
    
    Args:
        name: Exact city name
        
    Returns:
        City dict or None
    """
    name_lower = name.lower().strip()
    for city in INDIAN_CITIES:
        if city["name"].lower() == name_lower:
            return city
    return None


def get_cities_by_state(state: str) -> List[Dict]:
    """
    Get all cities in a state
    
    Args:
        state: State name
        
    Returns:
        List of cities in that state
    """
    return [
        city for city in INDIAN_CITIES
        if city["state"].lower() == state.lower().strip()
    ]


def get_cities_by_tier(tier: int) -> List[Dict]:
    """
    Get all cities of a specific tier
    
    Args:
        tier: City tier (1 or 2)
        
    Returns:
        List of cities in that tier
    """
    return [
        city for city in INDIAN_CITIES
        if city.get("tier") == tier
    ]


def get_tourist_destinations() -> List[Dict]:
    """
    Get all tourist destinations
    
    Returns:
        List of tourist cities
    """
    return [
        city for city in INDIAN_CITIES
        if city.get("tourist", False)
    ]


def validate_city_exists(name: str) -> bool:
    """
    Check if a city exists in the database
    
    Args:
        name: City name
        
    Returns:
        True if city exists, False otherwise
    """
    return get_city_by_name(name) is not None


# === METADATA ===
def get_stats() -> Dict:
    """Get database statistics"""
    return {
        "total_cities": len(INDIAN_CITIES),
        "tier_1": len(get_cities_by_tier(1)),
        "tier_2": len(get_cities_by_tier(2)),
        "tourist_destinations": len(get_tourist_destinations()),
        "states_covered": len(set(city["state"] for city in INDIAN_CITIES))
    }