# routes/itinerary.py
"""
Module 6: AI Itinerary Generation

This module:
1. Receives validated configuration from Module 5
2. Constructs optimized Gemini prompt
3. Generates detailed itinerary
4. Returns structured JSON response

CRITICAL: This is PURE AI generation - no constraint validation here
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import google.generativeai as genai
import os
import json

router = APIRouter()

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class TripSummary(BaseModel):
    """Trip summary from Module 5"""
    source: str
    destination: str
    distance_km: int
    travel_mode: str
    days: int

class Constraints(BaseModel):
    """Constraints from Module 5"""
    pace: str
    places_per_day: int
    start_time: str
    budget: str
    experience_style: str
    comfort_level: str

class OptionalConstraints(BaseModel):
    """Optional preferences from Module 5"""
    avoid_early_mornings: bool = False
    prefer_less_walking: bool = False
    family_friendly: bool = False
    vegetarian_friendly: bool = False
    photography_focus: bool = False

class ItineraryRequest(BaseModel):
    """Complete configuration from Module 5"""
    trip_summary: TripSummary
    constraints: Constraints
    interests: List[str]
    optional_constraints: OptionalConstraints
    ai_model: str

class TimeBlock(BaseModel):
    """Time block for activities"""
    title: str
    description: str

class DayItinerary(BaseModel):
    """Single day itinerary"""
    day: int
    morning: TimeBlock
    afternoon: TimeBlock
    evening: TimeBlock

class ItineraryResponse(BaseModel):
    """Final itinerary output"""
    destination: str
    days: int
    itinerary: List[DayItinerary]

# ============================================================================
# PROMPT CONSTRUCTION
# ============================================================================

def build_gemini_prompt(config: ItineraryRequest) -> str:
    """
    Construct optimized Gemini prompt from Module 5 configuration.
    
    Design principles:
    - Clear structure for AI understanding
    - Strict JSON format requirement
    - Explicit constraints to prevent hallucination
    - Balanced detail level
    
    Args:
        config: Complete configuration from Module 5
    
    Returns:
        Formatted prompt string
    """
    
    # Format interests as bullet points
    interests_formatted = "\n".join([f"- {interest}" for interest in config.interests])
    
    # Build optional constraints text
    optional_text = []
    if config.optional_constraints.avoid_early_mornings:
        optional_text.append("- Prefer late morning starts (after 9 AM)")
    if config.optional_constraints.prefer_less_walking:
        optional_text.append("- Minimize walking distances, suggest rest spots")
    if config.optional_constraints.family_friendly:
        optional_text.append("- Include family-friendly activities, kid-safe options")
    if config.optional_constraints.vegetarian_friendly:
        optional_text.append("- Prioritize vegetarian food options")
    if config.optional_constraints.photography_focus:
        optional_text.append("- Highlight photography opportunities and best times")
    
    optional_constraints_text = "\n".join(optional_text) if optional_text else "None"
    
    prompt = f"""You are a professional travel planner creating a realistic itinerary.

Generate a well-paced travel itinerary using these constraints:

TRIP SUMMARY:
- Source: {config.trip_summary.source}
- Destination: {config.trip_summary.destination}
- Duration: {config.trip_summary.days} days
- Travel mode: {config.trip_summary.travel_mode}
- Distance: {config.trip_summary.distance_km} km

TRAVEL STYLE:
- Pace: {config.constraints.pace}
- Target activities: {config.constraints.places_per_day} places per day (approximate)
- Start time preference: {config.constraints.start_time} mornings
- Budget level: {config.constraints.budget}
- Experience style: {config.constraints.experience_style}
- Comfort level: {config.constraints.comfort_level}

USER INTERESTS:
{interests_formatted}

ADDITIONAL PREFERENCES:
{optional_constraints_text}

STRICT RULES:
1. Respect the {config.constraints.places_per_day} places per day guideline
2. Do NOT invent travel routes, distances, or transportation details
3. Do NOT mention specific hotel names or exact prices
4. Keep activities realistic and achievable for {config.trip_summary.destination}
5. Balance activities across morning, afternoon, and evening
6. Consider travel time between activities
7. Include meal suggestions aligned with interests
8. Provide practical, actionable descriptions

OUTPUT FORMAT:
Return ONLY valid JSON. No markdown, no code blocks, no explanations.

{{
  "destination": "{config.trip_summary.destination}",
  "days": {config.trip_summary.days},
  "itinerary": [
    {{
      "day": 1,
      "morning": {{
        "title": "Activity name",
        "description": "Detailed description with timing, location, and practical tips"
      }},
      "afternoon": {{
        "title": "Activity name",
        "description": "Detailed description with timing, location, and practical tips"
      }},
      "evening": {{
        "title": "Activity name",
        "description": "Detailed description with timing, location, and practical tips"
      }}
    }}
  ]
}}

Generate the complete {config.trip_summary.days}-day itinerary now:"""
    
    return prompt

# ============================================================================
# GEMINI RESPONSE EXTRACTION
# ============================================================================

def safe_extract_text(response) -> Optional[str]:
    """
    Safely extract text from Gemini response.
    Handles multiple candidates and parts.
    
    Args:
        response: Gemini API response object
    
    Returns:
        Extracted text or None
    """
    if not response or not hasattr(response, 'candidates'):
        return None

    for candidate in response.candidates:
        content = getattr(candidate, "content", None)
        if not content:
            continue

        parts = getattr(content, "parts", [])
        for part in parts:
            text = getattr(part, "text", None)
            if text and text.strip():
                return text.strip()

    return None

def clean_json_response(raw_text: str) -> str:
    """
    Clean JSON response by removing markdown formatting.
    
    Handles:
    - ```json code blocks
    - ``` generic code blocks
    - Leading/trailing whitespace
    
    Args:
        raw_text: Raw response from Gemini
    
    Returns:
        Cleaned JSON string
    """
    text = raw_text.strip()
    
    # Remove markdown code blocks
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    
    if text.endswith("```"):
        text = text[:-3]
    
    return text.strip()

def validate_itinerary_structure(data: dict, expected_days: int) -> bool:
    """
    Validate itinerary JSON structure.
    
    Checks:
    - Required fields present
    - Correct number of days
    - All time blocks present
    
    Args:
        data: Parsed JSON dictionary
        expected_days: Expected number of days from config
    
    Returns:
        True if valid, False otherwise
    """
    try:
        # Check top-level fields
        if not all(key in data for key in ["destination", "days", "itinerary"]):
            return False
        
        # Check days count
        if data["days"] != expected_days:
            return False
        
        # Check itinerary array
        itinerary = data.get("itinerary", [])
        if len(itinerary) != expected_days:
            return False
        
        # Check each day structure
        for day_data in itinerary:
            required_fields = ["day", "morning", "afternoon", "evening"]
            if not all(field in day_data for field in required_fields):
                return False
            
            # Check each time block
            for time_block in ["morning", "afternoon", "evening"]:
                block = day_data[time_block]
                if not isinstance(block, dict):
                    return False
                if not all(key in block for key in ["title", "description"]):
                    return False
                if not block["title"] or not block["description"]:
                    return False
        
        return True
    
    except Exception:
        return False

# ============================================================================
# MAIN GENERATION ENDPOINT
# ============================================================================

@router.post("/api/itinerary", response_model=ItineraryResponse)
async def generate_itinerary(config: ItineraryRequest):
    """
    Generate AI-powered itinerary from Module 5 configuration.
    
    This is the final module - it trusts all input validation from Module 5.
    
    Process:
    1. Build optimized Gemini prompt
    2. Call Gemini API with selected model
    3. Extract and clean response
    4. Validate JSON structure
    5. Return structured itinerary
    
    Args:
        config: Complete configuration from Module 5
    
    Returns:
        ItineraryResponse with structured itinerary
    
    Raises:
        HTTPException 500: AI generation or parsing failed
    """
    
    try:
        # ====================================================================
        # STEP 1: BUILD PROMPT
        # ====================================================================
        prompt = build_gemini_prompt(config)
        
        # ====================================================================
        # STEP 2: CALL GEMINI API
        # ====================================================================
        model = genai.GenerativeModel(config.ai_model)
        
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,  # Balanced creativity
                max_output_tokens=8000,  # Sufficient for detailed itineraries
            ),
        )
        
        # ====================================================================
        # STEP 3: EXTRACT TEXT
        # ====================================================================
        raw_text = safe_extract_text(response)
        
        if not raw_text:
            raise ValueError("Gemini returned empty response")
        
        # ====================================================================
        # STEP 4: CLEAN AND PARSE JSON
        # ====================================================================
        cleaned_text = clean_json_response(raw_text)
        
        try:
            itinerary_data = json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing failed: {e}")
            print(f"Raw response preview: {raw_text[:500]}")
            raise ValueError(f"Invalid JSON response from AI: {str(e)}")
        
        # ====================================================================
        # STEP 5: VALIDATE STRUCTURE
        # ====================================================================
        if not validate_itinerary_structure(itinerary_data, config.trip_summary.days):
            raise ValueError("AI response missing required fields or incorrect structure")
        
        # ====================================================================
        # STEP 6: RETURN VALIDATED RESPONSE
        # ====================================================================
        return ItineraryResponse(**itinerary_data)
    
    except ValueError as e:
        # User-facing error for AI failures
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate itinerary: {str(e)}"
        )
    
    except Exception as e:
        # Catch-all for unexpected errors
        print(f"🔥 Unexpected error in itinerary generation: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during itinerary generation. Please try again."
        )

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/itinerary/health")
async def itinerary_health():
    """Health check for itinerary generation service"""
    return {
        "status": "ok",
        "service": "itinerary_generation",
        "endpoint": "/api/itinerary",
        "supported_models": [
            "gemini-flash-latest",
            "gemini-2.5-flash"
        ],
        "max_days": 30,
        "dependencies": ["Module 5 configuration"]
    }

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

"""
Example Request:
POST /api/itinerary

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

Example Response:
{
  "destination": "Goa",
  "days": 3,
  "itinerary": [
    {
      "day": 1,
      "morning": {
        "title": "Arrival & Calangute Beach",
        "description": "Arrive in Goa via train. Check into hotel in North Goa. Head to Calangute Beach for first beach experience. Relax, swim, try beach shacks for lunch. Timing: 12 PM - 3 PM."
      },
      "afternoon": {
        "title": "Fort Aguada Exploration",
        "description": "Visit historic Fort Aguada (17th century Portuguese fort). Panoramic views of Arabian Sea. Photography opportunity. Explore lighthouse and ramparts. Timing: 4 PM - 6 PM."
      },
      "evening": {
        "title": "Candolim Beach Sunset & Dinner",
        "description": "Watch sunset at Candolim Beach. Dinner at beachside restaurant - try Goan fish curry and prawn balchão. Live music venues available. Timing: 7 PM - 10 PM."
      }
    },
    ...
  ]
}

To test manually:
curl -X POST http://127.0.0.1:8000/api/itinerary \
  -H "Content-Type: application/json" \
  -d @module5_output.json
"""