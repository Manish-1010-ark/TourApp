from fastapi import APIRouter, HTTPException
from services.wikimedia_service import get_place_photos
from services.mapillary_service import geocode_place
import traceback
from services.destination_ai_service import generate_destination_description
router = APIRouter(
    prefix="/destination",
    tags=["Destination"]
)
@router.get("/info")
async def get_destination_info(search_query: str):
    """
    Returns the coordinates of a destination.
    """

    try:
        location = geocode_place(search_query)

        if location is None:
            raise HTTPException(
                status_code=404,
                detail="Destination not found."
            )

        place_name = search_query.split(",")[0].strip()

        # generate_destination_description never raises (it falls back to a
        # generic description internally), so a Gemini quota/API hiccup
        # can't turn this whole endpoint into a 500 anymore.
        description = generate_destination_description(place_name)

        photos = get_place_photos(search_query)

        return {
            "name": place_name,
            "search_query": search_query,

            "coordinates": {
                "latitude": location["latitude"],
                "longitude": location["longitude"]
            },

            "description": description,

            "photos": photos,

            "restaurants": [],

            "weather": None,

            "nearby_places": []
        }

    except HTTPException:
        raise 

    except Exception as e:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )