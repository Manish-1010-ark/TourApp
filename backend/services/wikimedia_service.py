import requests

HEADERS = {
    "User-Agent": "Traviora/1.0 (Educational Project)"
}


def get_place_photos(search_query: str, limit=5):
    try:
        url = "https://commons.wikimedia.org/w/api.php"

        params = {
            "action": "query",
            "generator": "search",
            "gsrsearch": search_query,
            "gsrnamespace": 6,
            "gsrlimit": limit,
            "prop": "imageinfo",
            "iiprop": "url",
            "format": "json"
        }

        response = requests.get(
            url,
            params=params,
            headers=HEADERS,
            timeout=10
        )

        response.raise_for_status()

        data = response.json()

        photos = []

        if "query" not in data:
            return photos

        for page in data["query"]["pages"].values():
            if "imageinfo" in page:
                photos.append(page["imageinfo"][0]["url"])

        return photos

    except Exception as e:
        print("Wikimedia Error:", e)
        return []