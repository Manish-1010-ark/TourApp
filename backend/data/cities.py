import json
from pathlib import Path

# Path to cities.json
DATA_FILE = Path(__file__).parent / "cities.json"

with open(DATA_FILE, "r", encoding="utf-8") as f:
    INDIAN_CITIES = json.load(f)


def search_cities(query: str, limit: int = 10):
    """
    Search cities by name.
    """
    query = query.lower().strip()

    results = [
        city for city in INDIAN_CITIES
        if query in city["name"].lower()
    ]

    return results[:limit]


def get_city_by_name(name: str):
    """
    Return full city object.
    """
    name = name.lower().strip()

    for city in INDIAN_CITIES:
        if city["name"].lower() == name:
            return city

    return None


def validate_city_exists(name: str):
    """
    True if city exists.
    """
    return get_city_by_name(name) is not None


def get_stats():
    """
    Dataset statistics.
    """
    states = {c["state"] for c in INDIAN_CITIES}

    return {
        "total_cities": len(INDIAN_CITIES),
        "total_states": len(states)
    }