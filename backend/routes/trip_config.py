# routes/trip_config.py
"""
Module 5: Trip Configuration & Confirmation (Constraint Finalizer)

This module:
1. Accepts user configuration (pace, budget, interests, constraints)
2. Converts inputs into a structured intent object for AI generation
3. Uses Gemini AI ONLY for interest suggestion (destination-aware)
4. Returns a complete constraint object ready for Module 6

NO ITINERARY GENERATION HERE | PURE CONSTRAINT PROCESSING
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import google.generativeai as genai
import os
import json

router = APIRouter()

# Initialize Gemini (for interest suggestion only)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ============================================================================
# ENUMS & CONSTANTS
# ============================================================================

class TravelPace(str, Enum):
    """Travel pace options"""
    RELAXED = "relaxed"
    BALANCED = "balanced"
    FAST = "fast"

class BudgetTier(str, Enum):
    """Budget tier options"""
    BASIC = "basic"
    PREMIUM = "premium"
    LUXURY = "luxury"

class AIModel(str, Enum):
    """AI model options for itinerary generation"""
    GEMINI_FLASH = "gemini-flash-latest"
    GEMINI_2_5_FLASH = "gemini-2.5-flash"

FALLBACK_INTERESTS = [
    "local food",
    "culture",
    "sightseeing",
    "nature",
    "shopping",
    "photography",
    "relaxation",
    "local markets"
]

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class LocationInfo(BaseModel):
    """Location information"""
    name: str = Field(..., description="City name")

class OptionalConstraints(BaseModel):
    """Optional user preferences"""
    avoid_early_mornings: bool = Field(False, description="Prefer late starts")
    prefer_less_walking: bool = Field(False, description="Minimize walking distances")
    family_friendly: bool = Field(False, description="Family-appropriate activities")
    vegetarian_friendly: bool = Field(False, description="Vegetarian food options")
    photography_focus: bool = Field(False, description="Photography opportunities")

class TripConfigRequest(BaseModel):
    """Request for trip configuration"""
    source: LocationInfo
    destination: LocationInfo
    distance_km: int = Field(..., ge=1, le=5000)
    travel_mode: str = Field(..., description="Selected travel mode")
    days: int = Field(..., ge=1, le=30)
    
    pace: TravelPace
    budget: BudgetTier
    
    selected_interests: Optional[List[str]] = Field(None, description="User-selected interests")
    optional_constraints: OptionalConstraints = Field(default_factory=OptionalConstraints)
    
    ai_model: AIModel = Field(AIModel.GEMINI_FLASH, description="AI model for generation")

class TripSummary(BaseModel):
    """Read-only trip summary"""
    source: str
    destination: str
    distance_km: int
    travel_mode: str
    days: int

class ConstraintsOutput(BaseModel):
    """Processed constraints for AI generation"""
    pace: str
    places_per_day: int
    start_time: str
    budget: str
    experience_style: str
    comfort_level: str

class TripConfigResponse(BaseModel):
    """Final structured intent object for Module 6"""
    trip_summary: TripSummary
    constraints: ConstraintsOutput
    interests: List[str]
    optional_constraints: OptionalConstraints
    ai_model: str

# ============================================================================
# INTEREST SUGGESTION SCHEMAS
# ============================================================================

class InterestSuggestionRequest(BaseModel):
    """Request for AI-suggested interests"""
    source: str
    destination: str
    travel_mode: str
    days: int

class InterestSuggestionResponse(BaseModel):
    """AI-suggested interests"""
    interests: List[str]
    destination: str

# ============================================================================
# PACE CONVERSION LOGIC (DETERMINISTIC)
# ============================================================================

def convert_pace_to_constraints(pace: TravelPace) -> dict:
    """
    Convert travel pace into concrete constraints.
    
    Why these mappings?
    - Relaxed: Tourists who want depth over breadth, leisurely mornings
    - Balanced: Standard tourist pace, moderate activity level
    - Fast: Maximizers who want to see everything, early risers
    
    These directly translate to prompts for AI itinerary generation.
    
    Args:
        pace: User's selected travel pace
    
    Returns:
        Dict with places_per_day and start_time
    """
    pace_mapping = {
        TravelPace.RELAXED: {
            "places_per_day": 2,  # 1-2 places (using midpoint)
            "start_time": "late"  # Start after 9 AM
        },
        TravelPace.BALANCED: {
            "places_per_day": 3,  # 3-4 places (using lower bound for safety)
            "start_time": "moderate"  # Start around 8 AM
        },
        TravelPace.FAST: {
            "places_per_day": 4,  # 4-5 places (using lower bound)
            "start_time": "early"  # Start before 8 AM
        }
    }
    
    return pace_mapping[pace]

# ============================================================================
# BUDGET CONVERSION LOGIC (DETERMINISTIC)
# ============================================================================

def convert_budget_to_constraints(budget: BudgetTier) -> dict:
    """
    Convert budget tier into experience assumptions.
    
    IMPORTANT: We do NOT suggest specific hotels or prices here.
    Budget only affects the STYLE of experiences suggested.
    
    Why these mappings?
    - Basic: Free/low-cost attractions, popular spots, street food
    - Premium: Balanced mix, curated experiences, comfortable dining
    - Luxury: Exclusive experiences, high-end venues, personalized service
    
    These guide AI on what types of activities to suggest.
    
    Args:
        budget: User's selected budget tier
    
    Returns:
        Dict with experience_style and comfort_level
    """
    budget_mapping = {
        BudgetTier.BASIC: {
            "experience_style": "popular & free attractions",
            "comfort_level": "basic"
        },
        BudgetTier.PREMIUM: {
            "experience_style": "balanced",
            "comfort_level": "comfortable"
        },
        BudgetTier.LUXURY: {
            "experience_style": "curated & relaxed",
            "comfort_level": "high"
        }
    }
    
    return budget_mapping[budget]

# ============================================================================
# AI INTEREST SUGGESTION (GEMINI ONLY)
# ============================================================================

def safe_extract_text(response) -> Optional[str]:
    """
    Safely extract text from Gemini response.
    Returns None if no valid text part is found.
    """
    if not response or not response.candidates:
        return None

    for candidate in response.candidates:
        content = getattr(candidate, "content", None)
        if not content:
            continue

        for part in getattr(content, "parts", []):
            text = getattr(part, "text", None)
            if text and text.strip():
                return text.strip()

    return None

def clean_json_response(raw_text: str) -> str:
    """
    Clean the JSON response by removing markdown formatting.
    """
    # Remove markdown code blocks
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]  # Remove ```json
    elif raw_text.startswith("```"):
        raw_text = raw_text[3:]  # Remove ```
    
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]  # Remove trailing ```
    
    return raw_text.strip()

def suggest_interests_with_ai(
    source: str,
    destination: str,
    travel_mode: str,
    days: int,
) -> list[str]:
    """
    Suggest interests using Gemini AI with proper error handling.
    """
    prompt = f"""
Suggest a list of general travel interest categories for a trip.

Trip details:
- Source: {source}
- Destination: {destination}
- Travel mode: {travel_mode}
- Duration: {days} days

Rules:
- Return 8 to 12 interest categories
- Each interest should be 1-3 words
- Examples: beaches, local food, culture, nightlife, nature
- Do NOT include place names
- Do NOT include explanations

Return ONLY a valid JSON array of strings. No markdown, no code blocks, just the array.
Example: ["beaches", "local food", "culture", "nightlife", "nature", "shopping", "photography", "heritage"]
"""

    try:
        model = genai.GenerativeModel("gemini-flash-latest")

        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,  # Increased from 500
            ),
        )

        raw_text = safe_extract_text(response)
        if not raw_text:
            raise ValueError("Gemini returned no usable text")

        # Clean the response text
        cleaned_text = clean_json_response(raw_text)
        
        # Parse JSON
        interests = json.loads(cleaned_text)

        # Validate the response
        if not isinstance(interests, list):
            raise ValueError("AI returned non-list format")

        if not all(isinstance(i, str) for i in interests):
            raise ValueError("AI returned non-string items")

        if len(interests) < 8 or len(interests) > 15:
            raise ValueError(f"AI returned {len(interests)} interests, expected 8-15")

        return interests

    except json.JSONDecodeError as e:
        print(f"⚠️ Failed to parse JSON from AI response: {e}")
        print(f"Raw response: {raw_text[:200] if raw_text else 'No response'}")
        print(f"Cleaned response: {cleaned_text[:200] if 'cleaned_text' in locals() else 'Not cleaned'}")
        return FALLBACK_INTERESTS
    
    except Exception as e:
        print(f"⚠️ Gemini failed, using fallback interests: {e}")
        return FALLBACK_INTERESTS

# ============================================================================
# INTEREST SUGGESTION ENDPOINT
# ============================================================================

@router.post("/api/interests/suggest", response_model=InterestSuggestionResponse)
async def suggest_interests(request: InterestSuggestionRequest):
    """
    Suggest destination-aware interests using Gemini AI.
    
    This endpoint ONLY suggests interests. User selection happens separately.
    
    Why separate endpoint?
    - Called independently before final configuration
    - Allows user to modify suggestions
    - Doesn't block main configuration flow
    
    Args:
        request: Trip context (source, destination, mode, days)
    
    Returns:
        InterestSuggestionResponse with 8-15 suggested interests
    """
    
    try:
        interests = suggest_interests_with_ai(
            request.source,
            request.destination,
            request.travel_mode,
            request.days
        )
        
        return InterestSuggestionResponse(
            interests=interests,
            destination=request.destination
        )
    
    except Exception as e:
        print(f"🔥 Unexpected error in interest suggestion: {e}")
        # Return fallback interests instead of raising error
        return InterestSuggestionResponse(
            interests=FALLBACK_INTERESTS,
            destination=request.destination
        )

# ============================================================================
# MAIN CONFIGURATION ENDPOINT
# ============================================================================

@router.post("/api/trip/configure", response_model=TripConfigResponse)
async def configure_trip(request: TripConfigRequest):
    """
    Convert user inputs into structured intent object for AI generation.
    
    THIS IS A CONSTRAINT FINALIZER.
    - No AI reasoning (except interests were suggested earlier)
    - No itinerary generation
    - Pure deterministic conversion of user choices
    
    Logic flow:
    1. Convert pace → places_per_day + start_time
    2. Convert budget → experience_style + comfort_level
    3. Validate interests (use suggestions if none provided)
    4. Package everything into a single structured object
    5. Return for Module 6 consumption
    
    Why this structure?
    - Single source of truth for Module 6
    - All constraints are explainable and traceable
    - Easy to modify without affecting AI generation
    - Clear separation of concerns
    
    Args:
        request: Complete user configuration
    
    Returns:
        TripConfigResponse with structured intent object
    
    Raises:
        HTTPException 400: Invalid input combinations
    """
    
    # ========================================================================
    # STEP 1: CONVERT PACE TO CONSTRAINTS
    # ========================================================================
    pace_constraints = convert_pace_to_constraints(request.pace)
    
    # ========================================================================
    # STEP 2: CONVERT BUDGET TO CONSTRAINTS
    # ========================================================================
    budget_constraints = convert_budget_to_constraints(request.budget)
    
    # ========================================================================
    # STEP 3: VALIDATE INTERESTS
    # ========================================================================
    # If user didn't select any interests, we can't proceed
    if not request.selected_interests or len(request.selected_interests) == 0:
        raise HTTPException(
            status_code=400,
            detail="At least one interest must be selected. Use /api/interests/suggest to get suggestions."
        )
    
    # Limit to 10 interests (prevent overwhelming AI)
    final_interests = request.selected_interests[:10]
    
    # ========================================================================
    # STEP 4: BUILD TRIP SUMMARY
    # ========================================================================
    trip_summary = TripSummary(
        source=request.source.name,
        destination=request.destination.name,
        distance_km=request.distance_km,
        travel_mode=request.travel_mode,
        days=request.days
    )
    
    # ========================================================================
    # STEP 5: BUILD CONSTRAINTS OBJECT
    # ========================================================================
    constraints = ConstraintsOutput(
        pace=request.pace.value,
        places_per_day=pace_constraints["places_per_day"],
        start_time=pace_constraints["start_time"],
        budget=request.budget.value,
        experience_style=budget_constraints["experience_style"],
        comfort_level=budget_constraints["comfort_level"]
    )
    
    # ========================================================================
    # STEP 6: RETURN COMPLETE STRUCTURED OBJECT
    # ========================================================================
    return TripConfigResponse(
        trip_summary=trip_summary,
        constraints=constraints,
        interests=final_interests,
        optional_constraints=request.optional_constraints,
        ai_model=request.ai_model.value
    )

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/trip/health")
async def trip_config_health():
    """Health check for trip configuration service"""
    return {
        "status": "ok",
        "service": "trip_configuration",
        "endpoints": {
            "suggest_interests": "/api/interests/suggest",
            "configure_trip": "/api/trip/configure"
        },
        "ai_usage": "Only for interest suggestion",
        "pace_options": [p.value for p in TravelPace],
        "budget_options": [b.value for b in BudgetTier],
        "ai_models": [m.value for m in AIModel]
    }

# ============================================================================
# EXAMPLE USAGE & TESTING
# ============================================================================

"""
Example 1: Interest Suggestion
POST /api/interests/suggest
{
  "source": "Mumbai",
  "destination": "Goa",
  "travel_mode": "train",
  "days": 3
}
Response:
{
  "interests": [
    "beaches",
    "local food",
    "nightlife",
    "water sports",
    "heritage sites",
    "markets",
    "photography",
    "nature & wildlife",
    "island hopping",
    "seafood dining"
  ],
  "destination": "Goa"
}

---

Example 2: Complete Trip Configuration
POST /api/trip/configure
{
  "source": {"name": "Mumbai"},
  "destination": {"name": "Goa"},
  "distance_km": 461,
  "travel_mode": "train",
  "days": 3,
  
  "pace": "balanced",
  "budget": "premium",
  
  "selected_interests": [
    "beaches",
    "local food",
    "nightlife",
    "water sports",
    "heritage sites"
  ],
  
  "optional_constraints": {
    "avoid_early_mornings": false,
    "prefer_less_walking": false,
    "family_friendly": true,
    "vegetarian_friendly": false,
    "photography_focus": true
  },
  
  "ai_model": "gemini-flash-latest"
}

Response:
{
  "trip_summary": {
    "source": "Mumbai",
    "destination": "Goa",
    "distance_km": 461,
    "travel_mode": "train",
    "days": 3
  },
  "constraints": {
    "pace": "balanced",
    "places_per_day": 3,
    "start_time": "moderate",
    "budget": "premium",
    "experience_style": "balanced",
    "comfort_level": "comfortable"
  },
  "interests": [
    "beaches",
    "local food",
    "nightlife",
    "water sports",
    "heritage sites"
  ],
  "optional_constraints": {
    "avoid_early_mornings": false,
    "prefer_less_walking": false,
    "family_friendly": true,
    "vegetarian_friendly": false,
    "photography_focus": true
  },
  "ai_model": "gemini-flash-latest"
}

---

To test manually:
# Step 1: Get interest suggestions
curl -X POST http://127.0.0.1:8000/api/interests/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Delhi",
    "destination": "Jaipur",
    "travel_mode": "car",
    "days": 2
  }'

# Step 2: Configure trip with selected interests
curl -X POST http://127.0.0.1:8000/api/trip/configure \
  -H "Content-Type: application/json" \
  -d '{
    "source": {"name": "Delhi"},
    "destination": {"name": "Jaipur"},
    "distance_km": 280,
    "travel_mode": "car",
    "days": 2,
    "pace": "balanced",
    "budget": "premium",
    "selected_interests": ["heritage sites", "local food", "photography"],
    "optional_constraints": {
      "avoid_early_mornings": false,
      "prefer_less_walking": false,
      "family_friendly": false,
      "vegetarian_friendly": true,
      "photography_focus": true
    },
    "ai_model": "gemini-flash-latest"
  }'
"""