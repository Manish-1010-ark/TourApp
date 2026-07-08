from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging

# Must run BEFORE the router imports below — routes/itinerary_route.py
# calls genai.configure(api_key=os.getenv("GOOGLE_API_KEY")) at import
# time, so the .env file has to be loaded first or GOOGLE_API_KEY is
# still None when that happens.
load_dotenv()

# Without this, Python only shows WARNING+ messages via its logging
# "last resort" handler — that's why errors were visible in the console
# but logger.info(...) calls (like the model-selection log) were silently
# dropped. This makes INFO-level logs from every module actually show up.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

from routes.location_routes import router as location_router
from routes.route_validation import router as route_router
from routes.travel_modes import router as travel_router
from routes.trip_config import router as trip_config_router  # Module 5
# NOTE: fixed to match the actual file — routes/itinerary_route.py.
# If your project's file is really named routes/itinerary.py instead,
# change this one line back.
from routes.itinerary_route import router as itinerary_router  # Module 6
from routes.chatbot import router as chatbot_router            # Module 7: AI Travel Chatbot
from routes.destination import router as destination_router    # Module 8: Destination discovery

from services.usage_tracker import reset_pro_usage, get_pro_usage_stats

app = FastAPI()

# ============================================================================
# ROUTER REGISTRATION
# ============================================================================
app.include_router(location_router)      # Module 1: City selection
app.include_router(route_router)         # Module 2: Route feasibility
app.include_router(travel_router)        # Module 3: Travel modes
app.include_router(trip_config_router)   # Module 5: Trip configuration
app.include_router(itinerary_router)     # Module 6: Itinerary generation
app.include_router(chatbot_router)       # Module 7: AI Travel Chatbot (floating widget)
app.include_router(destination_router)   # Module 8: Destination discovery

# ============================================================================
# CORS MIDDLEWARE
# ============================================================================
# NOTE: allow_origins=["*"] combined with allow_credentials=True is an
# invalid combination per the CORS spec — some browsers will silently
# reject the actual request even though this looks permissive. If you hit
# unexplained CORS failures while testing from a browser (not curl/Postman),
# switch allow_origins to your actual frontend origin(s), e.g.
# ["http://localhost:5173"], or set allow_credentials=False if you don't
# need cookies/auth headers sent cross-origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ADMIN ENDPOINTS
# ============================================================================
# Backed by services/usage_tracker.py (shared with routes/itinerary_route.py),
# keyed on "pro" instead of the old "flash_plus" counter.

@app.post("/api/admin/reset-counter")
def reset_premium_counter():
    """Reset pro-tier usage counter (for testing)"""
    reset_pro_usage()
    return {"message": "Pro tier usage counter reset", "usage": get_pro_usage_stats()}


@app.get("/api/admin/stats")
def get_stats():
    """Get current pro-tier usage statistics"""
    return get_pro_usage_stats()

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
            "trip_configuration": "/api/trip/configure",
            "interest_suggestion": "/api/interests/suggest",
            "itinerary_generation": "/api/itinerary",
            "chatbot": "/api/chat",
            "destination_discovery": "/destination/info",
        },
    }