import os
import requests
from dotenv import load_dotenv

load_dotenv()

MAPILLARY_ACCESS_TOKEN = os.getenv("MAPILLARY_ACCESS_TOKEN")

HEADERS = {
    "Authorization": f"OAuth {MAPILLARY_ACCESS_TOKEN}"
}
def geocode_place(search_query: str):
    """
    Convert a place name into latitude and longitude
    using OpenStreetMap Nominatim.
    """

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": search_query,
        "format": "json",
        "limit": 1
    }

    headers = {
        "User-Agent": "TravelApp/1.0"
    }

    response = requests.get(
        url,
        params=params,
        headers=headers,
        timeout=10
    )

    response.raise_for_status()

    results = response.json()

    print("Searching:", search_query)
    print("Results:", results)

    if not results:
        return None

    return {
        "latitude": float(results[0]["lat"]),
        "longitude": float(results[0]["lon"])
    }
print("Token:", MAPILLARY_ACCESS_TOKEN)
def find_nearest_image(lat: float, lon: float):
    """
    Find the nearest Mapillary image using the current Graph API.
    """

    bbox_size = 0.001  # roughly 200–250 meters

    west = lon - bbox_size
    south = lat - bbox_size
    east = lon + bbox_size
    north = lat + bbox_size

    url = "https://graph.mapillary.com/images"

    params = {
        "access_token": MAPILLARY_ACCESS_TOKEN,
        "fields": "id,computed_geometry,is_pano,captured_at",
        "bbox": f"{west},{south},{east},{north}",
        "limit": 10
    }

    response = requests.get(url, params=params, timeout=15)

    response.raise_for_status()

    data = response.json()

    print(data)

    if "data" not in data:
        return None

    if len(data["data"]) == 0:
        return None

    # Prefer a panorama if one exists
    for image in data["data"]:
        if image.get("is_pano"):
            return image

    # Otherwise return the nearest image
    return data["data"][0]


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    place = "Jama Masjid, Old Delhi, Delhi, India"

    location = geocode_place(place)

    print(location)

    image = find_nearest_image(
        location["latitude"],
        location["longitude"]
    )

    print(image)