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

    try:
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        results = response.json()
    except requests.RequestException as e:
        print("Geocoding failed:", e)
        return None

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

    if response.status_code != 200:
        print("Mapillary API error:", response.status_code, response.text[:300])
        return None

    data = response.json()

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


def get_image_url(image_id: str):
    """
    Fetch the actual displayable image URL for a Mapillary image ID.

    find_nearest_image() only returns metadata (id, geometry, is_pano) —
    this second call is required to get a URL that can actually be
    rendered in the frontend.
    """

    url = f"https://graph.mapillary.com/{image_id}"

    params = {
        "access_token": MAPILLARY_ACCESS_TOKEN,
        "fields": "thumb_2048_url"
    }

    response = requests.get(url, params=params, timeout=15)

    if response.status_code != 200:
        print("Mapillary image URL fetch error:", response.status_code, response.text[:300])
        return None

    data = response.json()

    return data.get("thumb_2048_url")


def get_nearest_image_with_url(lat: float, lon: float):
    """
    Convenience wrapper: finds the nearest image AND resolves its URL,
    while explicitly carrying forward whether it's a true 360 pano or
    just a regular flat photo. Callers must check `is_pano` before
    treating `image_url` as an equirectangular panorama — a flat photo
    fed into a 360 viewer will render distorted.

    Returns None if no image at all was found nearby.
    """

    image = find_nearest_image(lat, lon)

    if image is None:
        return None

    image_url = get_image_url(image["id"])

    if image_url is None:
        return None

    return {
        "image_id": image["id"],
        "image_url": image_url,
        "is_pano": bool(image.get("is_pano")),
        "captured_at": image.get("captured_at"),
    }


# ============================================================
# Test
# ============================================================

if __name__ == "__main__":

    place = "Jama Masjid, Old Delhi, Delhi, India"

    location = geocode_place(place)

    print(location)

    image = get_nearest_image_with_url(
        location["latitude"],
        location["longitude"]
    )

    print(image)