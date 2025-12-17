from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json
from routes.location_routes import router as location_router
from routes.route_validation import router as route_router
from routes.travel_modes import router as travel_router
from routes.trip_config import router as trip_config_router  # NEW: Module 5
from routes.itinerary import router as itinerary_router     # Module 6

from schemas.itinerary import ItineraryResponse
from schemas.request import ItineraryRequest
from services.gemini_service import generate_itinerary

load_dotenv()

app = FastAPI()

# ============================================================================
# ROUTER REGISTRATION
# ============================================================================
app.include_router(location_router)      # Module 1: City selection
app.include_router(route_router)         # Module 2: Route feasibility
app.include_router(travel_router)        # Module 3: Travel modes
app.include_router(trip_config_router)   # Module 5: Trip configuration (NEW)
app.include_router(itinerary_router)     # Module 6: Itinerary generation

# ============================================================================
# CORS MIDDLEWARE
# ============================================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)

# ============================================================================
# EXISTING ITINERARY GENERATION (UNCHANGED)
# ============================================================================

# In-memory counter for premium model usage (simple gating)
premium_usage_counter = {"flash_plus": 0}
PREMIUM_LIMIT = 3  # Allow 3 uses per server session

# @app.post("/api/itinerary", response_model=ItineraryResponse)
# def create_itinerary(request: ItineraryRequest):
#     """
#     Generate AI-powered travel itinerary
    
#     Args:
#         request: ItineraryRequest containing destination, interests, and model choice
    
#     Returns:
#         ItineraryResponse with generated itinerary
    
#     Raises:
#         HTTPException: 400 for invalid inputs, 429 for rate limits
#     """
#     destination = request.destination
#     interests = request.interests
#     model = request.model

#     # Validation
#     if not destination or not destination.strip():
#         raise HTTPException(
#             status_code=400, 
#             detail="Destination is required"
#         )
    
#     if not interests or len(interests) == 0:
#         raise HTTPException(
#             status_code=400, 
#             detail="At least one interest is required"
#         )

#     # Premium model gating
#     if model == "flash_plus":
#         if premium_usage_counter["flash_plus"] >= PREMIUM_LIMIT:
#             raise HTTPException(
#                 status_code=429,
#                 detail=f"Premium model limit reached ({PREMIUM_LIMIT} uses per session). Please restart server or use standard model."
#             )
#         premium_usage_counter["flash_plus"] += 1
#         print(f"✨ Premium model usage: {premium_usage_counter['flash_plus']}/{PREMIUM_LIMIT}")

#     # Temporary: only Goa 3 days supported
#     if destination.lower() != "goa":
#         raise HTTPException(
#             status_code=400, 
#             detail="Only 'Goa' is supported as a destination currently"
#         )

#     # Load template
#     try:
#         with open("templates/goa_3_days.json", "r") as f:
#             template = json.load(f)
#     except FileNotFoundError:
#         raise HTTPException(
#             status_code=500,
#             detail="Template file not found. Please check server configuration."
#         )

#     # Generate itinerary
#     try:
#         ai_output = generate_itinerary(template, interests, model)
#         parsed = json.loads(ai_output)
#         return parsed
    
#     except json.JSONDecodeError as e:
#         print(f"🔥 JSON Parse Error: {e}")
#         raise HTTPException(
#             status_code=500,
#             detail="Failed to parse AI response. Please try again."
#         )
    
#     except ValueError as e:
#         print(f"🔥 Value Error: {e}")
#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )
    
#     except Exception as e:
#         print(f"🔥 Unexpected Error: {e}")
#         # Return fallback itinerary instead of exposing error
#         return {
#             "destination": "Goa",
#             "days": 3,
#             "itinerary": [
#                 {
#                     "day": 1,
#                     "morning": {
#                         "title": "Beach Exploration",
#                         "description": "Start your day at a peaceful North Goa beach."
#                     },
#                     "afternoon": {
#                         "title": "Local Cuisine",
#                         "description": "Enjoy authentic Goan seafood at a beach shack."
#                     },
#                     "evening": {
#                         "title": "Sunset Views",
#                         "description": "Watch the sunset while exploring coastal cafés."
#                     }
#                 },
#                 {
#                     "day": 2,
#                     "morning": {
#                         "title": "Cultural Heritage",
#                         "description": "Visit historic churches in Old Goa."
#                     },
#                     "afternoon": {
#                         "title": "City Exploration",
#                         "description": "Walk through colorful Fontainhas in Panaji."
#                     },
#                     "evening": {
#                         "title": "River Cruise",
#                         "description": "Enjoy an evening cruise on the Mandovi River."
#                     }
#                 },
#                 {
#                     "day": 3,
#                     "morning": {
#                         "title": "South Goa Beaches",
#                         "description": "Relax at serene beaches like Palolem or Colva."
#                     },
#                     "afternoon": {
#                         "title": "Leisure Time",
#                         "description": "Unwind with a beachside lunch and water activities."
#                     },
#                     "evening": {
#                         "title": "Departure Prep",
#                         "description": "Shop for souvenirs and prepare for departure."
#                     }
#                 }
#             ]
#         }

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================

@app.post("/api/admin/reset-counter")
def reset_premium_counter():
    """Reset premium model usage counter (for testing)"""
    premium_usage_counter["flash_plus"] = 0
    return {"message": "Premium counter reset", "usage": premium_usage_counter}

@app.get("/api/admin/stats")
def get_stats():
    """Get current usage statistics"""
    return {
        "premium_usage": premium_usage_counter["flash_plus"],
        "premium_limit": PREMIUM_LIMIT,
        "remaining": PREMIUM_LIMIT - premium_usage_counter["flash_plus"]
    }

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "AI Itinerary API is running",
        "modules": {
            "location_discovery": "/api/locations/search",
            "route_validation": "/api/route/validate",
            "travel_modes": "/api/travel/modes",
            "trip_configuration": "/api/trip/configure",  # NEW
            "interest_suggestion": "/api/interests/suggest",  # NEW
            "itinerary_generation": "/api/itinerary"
        }
    }