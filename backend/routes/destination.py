from fastapi import APIRouter, HTTPException

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

        description = generate_destination_description(
        search_query.split(",")[0].strip()
        )

        if location is None:
            raise HTTPException(
                status_code=404,
                detail="Destination not found."
            )

        return {
            "name": search_query.split(",")[0].strip(),

            "search_query": search_query,

            "coordinates": {
                "latitude": location["latitude"],
                "longitude": location["longitude"]
            },

            "description": description,

            "photos": [],

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