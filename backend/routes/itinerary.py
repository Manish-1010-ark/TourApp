# routes/itinerary.py
"""
Module 6: AI Itinerary Generation

This module:
1. Receives validated configuration from Module 5
2. Constructs optimized Gemini prompt
3. Generates detailed itinerary
4. Returns structured JSON response

CRITICAL: This is PURE AI generation - no constraint validation here

ENHANCED SCHEMA (v2.0):
- More detailed day structure with themes and summaries
- Flexible time blocks instead of fixed morning/afternoon/evening
- Activity type categorization
- Enhanced meal information
- Photography and logistics hints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator, field_validator
from typing import List, Optional, Dict, Any, Literal
import google.generativeai as genai
import os
import json

router = APIRouter()

# Initialize Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ============================================================================
# ENHANCED REQUEST/RESPONSE SCHEMAS (v2.0)
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

# --- NEW ENHANCED MODELS (v2.0) ---

class Meal(BaseModel):
    """Enhanced meal information"""
    meal_type: Literal["breakfast", "lunch", "dinner", "snack", "none"] = "none"
    cuisine_type: str = "local"
    dining_style: str = "restaurant"
    veg_friendly: bool = True

class ItineraryBlock(BaseModel):
    """Enhanced itinerary time block"""
    period: Literal["morning", "afternoon", "evening"]  # Simplified to only these three
    time_window: str  # e.g., "09:00–11:30"
    title: str
    activity_type: Literal["sightseeing", "culture", "food", "relaxation", 
                          "adventure", "shopping", "beach", "nature", 
                          "history", "art", "music", "sports"]  # Strict list
    description: str
    logistics_hint: Optional[str] = None
    meal: Meal = Field(default_factory=lambda: Meal(meal_type="none"))
    photography_note: Optional[str] = None
    
    @field_validator('meal', mode='before')
    @classmethod
    def ensure_meal_not_none(cls, v):
        """Ensure meal is never None - convert to default Meal if needed"""
        if v is None:
            return {"meal_type": "none", "cuisine_type": "local", "dining_style": "restaurant", "veg_friendly": True}
        return v

class DayPlan(BaseModel):
    """Enhanced day plan with theme and summary"""
    day: int
    day_theme: str
    day_summary: str
    blocks: List[ItineraryBlock]

class OverallStyle(BaseModel):
    """Overall trip style summary"""
    pace: str
    budget: str

class ItineraryResponse(BaseModel):
    """Enhanced final itinerary output (v2.0)"""
    destination: str
    days: int
    overall_style: OverallStyle
    itinerary: List[DayPlan]

# ============================================================================
# ENHANCED PROMPT CONSTRUCTION (v2.0) - FIXED
# ============================================================================

def build_gemini_prompt(config: ItineraryRequest) -> str:
    """
    Construct enhanced Gemini prompt from Module 5 configuration.
    
    Enhanced design principles:
    - Clear structure for AI understanding
    - Strict JSON format requirement matching new schema
    - Flexible time blocks instead of fixed periods
    - Enhanced categorization and metadata
    
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
    
    prompt = f"""You are a professional travel planner creating a detailed, structured itinerary.

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

IMPORTANT INSTRUCTIONS:
1. Create {config.trip_summary.days} days of activities
2. Each day should have 2-4 time blocks
3. EVERY block must include a meal object, even if it's just {{"meal_type": "none"}}
4. Add logistics hints for practical navigation
5. Note photography opportunities if relevant
6. Balance activity types across days
7. Consider realistic travel times between locations
8. Align with the user's budget and comfort level

========================
CRITICAL ENUM ENFORCEMENT (MANDATORY)
========================
- You MUST use ONLY the allowed enum values listed below.
- DO NOT invent or vary enum values.
- If unsure, map activities using the mapping rules.

Allowed activity_type values:
sightseeing, culture, food, relaxation,
adventure, shopping, beach, nature,
history, art, music, sports

Allowed period values:
morning, afternoon, evening

Allowed meal_type values:
breakfast, lunch, dinner, none

If an activity involves photography:
- Use activity_type = sightseeing
- Put photography details ONLY inside photography_note

If an activity involves architecture or heritage:
- Use activity_type = history

If an activity involves travel or driving:
- Use activity_type = sightseeing

For dining_style, use ONLY these normalized values:
street, café, restaurant, beachside

STRICT RULES:
1. Respect the {config.constraints.places_per_day} places per day guideline
2. Do NOT invent travel routes, distances, or transportation details
3. Do NOT mention specific hotel names or exact prices
4. Keep activities realistic and achievable for {config.trip_summary.destination}
5. Consider travel time between activities
6. Provide practical, actionable descriptions
7. Return ONLY valid JSON - no markdown, no code blocks, no explanations
8. NEVER set "meal" to null - always include a meal object
9. STRICTLY FOLLOW the enum values above - NO EXCEPTIONS

CRITICAL: You MUST use this exact JSON structure:

{{
  "destination": "{config.trip_summary.destination}",
  "days": {config.trip_summary.days},
  "overall_style": {{
    "pace": "{config.constraints.pace}",
    "budget": "{config.constraints.budget}"
  }},
  "itinerary": [
    {{
      "day": 1,
      "day_theme": "Arrival & Exploration",
      "day_summary": "Begin your journey with an introduction to the destination",
      "blocks": [
        {{
          "period": "morning",
          "time_window": "09:00–11:30",
          "title": "Welcome Activity",
          "activity_type": "sightseeing",
          "description": "Start your trip with an introductory activity.",
          "logistics_hint": "Optional practical tip",
          "meal": {{
            "meal_type": "breakfast",
            "cuisine_type": "local",
            "dining_style": "restaurant",
            "veg_friendly": true
          }},
          "photography_note": "Optional photography suggestion"
        }},
        {{
          "period": "afternoon",
          "time_window": "13:00–15:30",
          "title": "Cultural Experience",
          "activity_type": "culture",
          "description": "Explore local culture and traditions.",
          "logistics_hint": "Optional practical tip",
          "meal": {{
            "meal_type": "lunch",
            "cuisine_type": "local",
            "dining_style": "restaurant",
            "veg_friendly": true
          }},
          "photography_note": "Optional photography suggestion"
        }},
        {{
          "period": "evening",
          "time_window": "18:00–20:30",
          "title": "Evening Relaxation",
          "activity_type": "relaxation",
          "description": "Wind down after a day of exploration.",
          "logistics_hint": "Optional practical tip",
          "meal": {{
            "meal_type": "dinner",
            "cuisine_type": "local",
            "dining_style": "restaurant",
            "veg_friendly": true
          }},
          "photography_note": "Optional photography suggestion"
        }}
      ]
    }}
  ]
}}

Generate the complete {config.trip_summary.days}-day itinerary now:"""
    
    return prompt

# ============================================================================
# GEMINI RESPONSE EXTRACTION (UNCHANGED)
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

# ============================================================================
# ENHANCED VALIDATION LOGIC (v2.0) - FIXED
# ============================================================================

def validate_itinerary_structure(data: dict, expected_days: int) -> bool:
    """
    Validate enhanced itinerary JSON structure.
    
    Enhanced checks:
    - Overall style present
    - Each day has theme, summary, and flexible blocks
    - Block structure with proper types
    - Meal information when present
    
    Args:
        data: Parsed JSON dictionary
        expected_days: Expected number of days from config
    
    Returns:
        True if valid, False otherwise
    """
    try:
        # Check top-level fields
        required_top_fields = ["destination", "days", "overall_style", "itinerary"]
        if not all(key in data for key in required_top_fields):
            return False
        
        # Check days count
        if data["days"] != expected_days:
            return False
        
        # Check overall_style structure
        overall_style = data.get("overall_style", {})
        if not isinstance(overall_style, dict):
            return False
        if not all(key in overall_style for key in ["pace", "budget"]):
            return False
        
        # Check itinerary array
        itinerary = data.get("itinerary", [])
        if len(itinerary) != expected_days:
            return False
        
        # Valid period values (STRICT - only these three)
        valid_periods = {"morning", "afternoon", "evening"}
        
        # Valid activity types (STRICT - only these)
        valid_activity_types = {"sightseeing", "culture", "food", "relaxation", 
                               "adventure", "shopping", "beach", "nature", 
                               "history", "art", "music", "sports"}
        
        # Check each day structure
        for day_idx, day_data in enumerate(itinerary):
            # Check day number is sequential
            if day_data.get("day") != day_idx + 1:
                return False
            
            # Check required day fields
            required_day_fields = ["day", "day_theme", "day_summary", "blocks"]
            if not all(field in day_data for field in required_day_fields):
                return False
            
            # Check blocks is a list
            blocks = day_data.get("blocks", [])
            if not isinstance(blocks, list):
                return False
            
            # Ensure at least 1 block per day (more flexible)
            if len(blocks) < 1:
                return False
            
            # Check each block structure
            for block in blocks:
                # Required block fields
                required_block_fields = ["period", "time_window", "title", 
                                       "activity_type", "description"]
                if not all(field in block for field in required_block_fields):
                    return False
                
                # Validate period value (STRICT)
                if block["period"] not in valid_periods:
                    print(f"Invalid period: {block['period']}. Must be one of {valid_periods}")
                    return False
                
                # Validate activity_type value (STRICT)
                if block["activity_type"] not in valid_activity_types:
                    print(f"Invalid activity_type: {block['activity_type']}. Must be one of {valid_activity_types}")
                    return False
                
                # Ensure meal field exists (even if null, our validator will fix it)
                if "meal" not in block:
                    block["meal"] = {"meal_type": "none"}
        
        return True
    
    except Exception as e:
        print(f"Validation error: {e}")
        return False

# ============================================================================
# MAIN GENERATION ENDPOINT (UPDATED FOR v2.0) - FIXED
# ============================================================================

@router.post("/api/itinerary", response_model=ItineraryResponse)
async def generate_itinerary(config: ItineraryRequest):
    """
    Generate AI-powered itinerary from Module 5 configuration.
    
    This is the final module - it trusts all input validation from Module 5.
    
    Enhanced process (v2.0):
    1. Build enhanced Gemini prompt with new schema
    2. Call Gemini API with selected model
    3. Extract and clean response
    4. Validate enhanced JSON structure
    5. Return structured itinerary with flexible blocks
    
    Args:
        config: Complete configuration from Module 5
    
    Returns:
        ItineraryResponse with enhanced structured itinerary
    
    Raises:
        HTTPException 500: AI generation or parsing failed
    """
    
    try:
        # ====================================================================
        # STEP 1: BUILD ENHANCED PROMPT
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
                max_output_tokens=10000,  # Increased for detailed blocks
            ),
        )
        
        # ====================================================================
        # STEP 3: EXTRACT TEXT
        # ====================================================================
        raw_text = safe_extract_text(response)
        print("==================================")
        print("Raw Gemini Response Preview:")
        print(raw_text)  # Print first 500 chars for debugging
        print("==================================")
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
        # STEP 5: VALIDATE AND FIX STRUCTURE
        # ====================================================================
        # First, fix any null meals in the data before validation
        def fix_null_meals(data):
            if isinstance(data, dict):
                # Fix meal if it's null
                if "meal" in data and data["meal"] is None:
                    data["meal"] = {"meal_type": "none", "cuisine_type": "local", "dining_style": "restaurant", "veg_friendly": True}
                # Recursively check nested structures
                for key, value in data.items():
                    if isinstance(value, (dict, list)):
                        fix_null_meals(value)
            elif isinstance(data, list):
                for item in data:
                    fix_null_meals(item)
        
        fix_null_meals(itinerary_data)
        
        # Now validate
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
# HEALTH CHECK (UPDATED)
# ============================================================================

@router.get("/api/itinerary/health")
async def itinerary_health():
    """Health check for itinerary generation service"""
    return {
        "status": "ok",
        "service": "itinerary_generation_v2",
        "endpoint": "/api/itinerary",
        "schema_version": "2.0",
        "features": [
            "flexible_time_blocks",
            "day_themes_and_summaries",
            "activity_typing",
            "enhanced_meal_info",
            "photography_notes",
            "logistics_hints"
        ],
        "supported_models": [
            "gemini-flash-latest",
            "gemini-2.5-flash"
        ],
        "max_days": 30,
        "dependencies": ["Module 5 configuration"]
    }

# ============================================================================
# ENHANCED EXAMPLE USAGE (v2.0)
# ============================================================================

"""
Example Request (UNCHANGED - backward compatible):
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
    "vegetarian_friendly": true,
    "photography_focus": true
  },
  "ai_model": "gemini-flash-latest"
}

To test manually:
curl -X POST http://127.0.0.1:8000/api/itinerary \
  -H "Content-Type: application/json" \
  -d @module5_output.json
"""