# routes/itinerary_route.py
"""
Module 6: AI Itinerary Generation (v3.0 — full travel guide)

This module:
1. Receives validated configuration from Module 5 (schemas.request.ItineraryRequest)
2. Constructs a travel-consultant Gemini prompt covering the full guide
3. Generates weather, budget, food, attractions, tips, and a day-wise itinerary
4. Injects facts Module 5 already knows (destination, distance, travel mode,
   style) deterministically rather than letting the AI re-derive them
5. Returns a schemas.itinerary.ItineraryResponse

v3.0 changes from v2.0:
- Request/response models now live in schemas/ (single source of truth —
  the route no longer redeclares its own copies, which had drifted from
  schemas/request.py and schemas/itinerary.py).
- activity_type enum aligned to the frontend's actual icon/style set
  (food, sightseeing, hotel, travel, shopping, nature, adventure, culture,
  relaxation, photography, beach, arrival) — no more forcing photography/
  travel/hotel moments into "sightseeing" or "history" to work around a
  mismatched enum.
- Dropped the unused "period" (morning/afternoon/evening) field — the
  frontend never reads it; time_window + activity_type already do the job.
- Blocks now carry location, estimated_duration, estimated_cost,
  important_tip, optional_label — fields TimelineItem.jsx already renders
  but the backend never populated.
- Added the full "travel guide" sections: weather, budget_breakdown,
  must_visit_places, hidden_gems, local_food, restaurant_recommendations,
  shopping_suggestions, photography_tips, travel_tips,
  essential_information, emergency_contacts, transportation_advice,
  packing_list.
- destination/source/days/travel_mode/overall_style/trip_stats are set
  deterministically from the request, not asked of the AI — these are
  known facts, not content, and re-generating them was a hallucination
  risk for no benefit.
- Replaced the ~90-line hand-rolled validate_itinerary_structure with
  Pydantic validation + a small normalize_response repair pass (unknown
  keys -> additional_information, invalid enum values -> None instead of
  a hard failure).
"""

import json
import logging
import os
import re
from typing import Any, Dict, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException

from schemas.request import ItineraryRequest
from schemas.itinerary import (
    ItineraryResponse,
    OverallStyle,
    TripStats,
)
from services.usage_tracker import check_and_increment_pro_usage

logger = logging.getLogger("itinerary")

router = APIRouter()

# Loaded here too (not just in main.py) so this module configures Gemini
# correctly even if it's ever imported before main.py's load_dotenv() runs,
# or imported standalone (e.g. in a test file).
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# ============================================================================
# MODEL MAP
# ============================================================================

# Two user-facing tiers, matching AIModelSelector.jsx's "standard"/"pro"
# values. Users never see "Gemini" or a version number — only the tier.
MODEL_MAP = {
    "standard": "models/gemini-2.5-flash",
    # STOPGAP: Gemini Pro models are paid-only on the free tier as of
    # April 1, 2026 (confirmed via 429 ResourceExhausted, limit: 0 for
    # gemini-2.5-pro on this key). Routing "pro" to Flash so selecting it
    # doesn't hard-fail. Revert this to "models/gemini-2.5-pro" once
    # billing is enabled on the Google Cloud project.
    "pro": "models/gemini-3.5-flash",

    # Backward compatibility with previously used ai_model values
    "flash_lite": "models/gemini-2.5-flash",
    "flash": "models/gemini-2.5-flash",
    "flash_plus": "models/gemini-3.5-flash",  # was gemini-2.5-pro, see note above
    "gemini-flash-latest": "models/gemini-2.5-flash",
    "gemini-2.5-flash": "models/gemini-2.5-flash",
    "gemini-2.5-pro": "models/gemini-3.5-flash",  # was gemini-2.5-pro, see note above
}

# Tiers that count against the "pro" usage counter, even though they
# currently resolve to the same underlying Flash model as "standard"
# (see MODEL_MAP stopgap above). Keeping this separate from MODEL_MAP's
# values means usage tracking still reflects what the user *selected*,
# not which model actually ran.
PRO_TIER_ALIASES = {"pro", "flash_plus", "gemini-2.5-pro"}

ALLOWED_ACTIVITY_TYPES = {
    "food", "sightseeing", "hotel", "travel", "shopping", "nature",
    "adventure", "culture", "relaxation", "photography", "beach", "arrival",
}

# Fields the server fills in deterministically — never expected from the AI.
SERVER_OWNED_FIELDS = {"destination", "source", "days", "travel_mode", "overall_style", "trip_stats"}

RESPONSE_JSON_SCHEMA_HINT = """
{
  "weather": { "icon": "string or null", "temp_min": number, "temp_max": number, "summary": "string", "best_time_to_visit": "string" },
  "budget_breakdown": { "total": number, "accommodation": number, "food": number, "transportation": number, "entry_tickets": number, "shopping": number, "miscellaneous": number },
  "transportation_advice": ["string"],
  "packing_list": ["string"],
  "must_visit_places": [{ "name": "string", "description": "string", "category": "string" }],
  "hidden_gems": [{ "name": "string", "description": "string", "category": "string" }],
  "local_food": [{ "name": "string", "description": "string" }],
  "restaurant_recommendations": [{ "name": "string", "description": "string", "cuisine": "string", "price_range": "string", "location": "string" }],
  "shopping_suggestions": ["string"],
  "photography_tips": ["string"],
  "travel_tips": ["string"],
  "essential_information": { "emergency_number": "string", "hospital": "string", "police": "string", "tourist_helpline": "string", "transport_info": "string", "atm_availability": "string", "mobile_network": "string" },
  "emergency_contacts": { "label": "phone number" },
  "itinerary": [
    {
      "day": 1,
      "day_theme": "string",
      "day_summary": "string",
      "highlights": ["string"],
      "blocks": [
        {
          "id": "d1-1",
          "time_window": "09:00-11:30",
          "activity_type": "food | sightseeing | hotel | travel | shopping | nature | adventure | culture | relaxation | photography | beach | arrival",
          "title": "string",
          "description": "string",
          "location": "string",
          "estimated_duration": "string",
          "estimated_cost": "string",
          "meal": { "meal_type": "breakfast | lunch | dinner | snack | none", "cuisine_type": "string", "dining_style": "string", "veg_friendly": true },
          "logistics_hint": "string or null",
          "photography_note": "string or null",
          "important_tip": "string or null",
          "optional_label": "string or null"
        }
      ]
    }
  ]
}
""".strip()


# ============================================================================
# PROMPT CONSTRUCTION
# ============================================================================

def build_gemini_prompt(config: ItineraryRequest) -> str:
    """Builds the travel-consultant prompt. Deliberately does NOT ask for
    destination/days/travel_mode/distance_km/overall_style — Module 5
    already knows those; the AI only needs to produce content."""

    interests_formatted = "\n".join(f"- {i}" for i in config.interests)

    optional_text = []
    oc = config.optional_constraints
    if oc.avoid_early_mornings:
        optional_text.append("- Prefer late morning starts (after 9 AM)")
    if oc.prefer_less_walking:
        optional_text.append("- Minimize walking distances, suggest rest spots")
    if oc.family_friendly:
        optional_text.append("- Include family-friendly activities, kid-safe options")
    if oc.vegetarian_friendly:
        optional_text.append("- Prioritize vegetarian food options")
    if oc.photography_focus:
        optional_text.append("- Highlight photography opportunities and best times")
    optional_constraints_text = "\n".join(optional_text) if optional_text else "None"

    return f"""You are an experienced professional travel consultant producing a complete travel guide — not just a schedule — for a client.

TRIP SUMMARY (already finalized — do not restate or contradict these):
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

Think through, in order, before writing output (do not show this thinking — only the final JSON is returned):
1. Seasonal/weather context for this trip  2. Realistic budget breakdown  3. Transportation advice
4. Packing recommendations  5. Must-visit attractions  6. Hidden gems  7. Local food guide
8. Restaurant recommendations  9. Shopping suggestions  10. Photography locations and timing
11. Practical travel tips  12. Essential information (hospitals, police, connectivity)
13. Emergency contact numbers for {config.trip_summary.destination}'s country/region
14. Day-by-day itinerary with time-blocked activities

Requirements:
- Every recommendation must be specific to {config.trip_summary.destination} — no generic filler that could apply to any destination.
- Never invent an attraction, restaurant, or landmark that does not exist. If unsure of a specific real name, describe the type of place instead (e.g. "a riverside seafood shack in the old quarter") rather than fabricating one.
- Realistic travel times between activities given actual geography and {config.trip_summary.travel_mode} logistics.
- Budget figures must reflect real-world costs for {config.trip_summary.destination} at a "{config.constraints.budget}" level, broken down by category.
- Do not repeat the same tip or recommendation in more than one section. Do not pad lists with filler just to hit a count.
- Create exactly {config.trip_summary.days} day objects, each with at least one activity block, respecting the ~{config.constraints.places_per_day} places/day guideline.
- For activity_type, use ONLY: food, sightseeing, hotel, travel, shopping, nature, adventure, culture, relaxation, photography, beach, arrival. Use "arrival" for the day-1 arrival/check-in block, "hotel" for accommodation-centric blocks, "travel" for transit legs, "photography" for dedicated photo-spot stops (photography_note can add detail beyond that too if photography_focus is set).
- Always include a "meal" object on every block, even if {{"meal_type": "none"}} for non-meal activities.
- Do NOT include destination, days, travel_mode, distance_km, source, or overall_style in your output — those are already finalized and will be added by the system. Only produce the fields listed in the schema below.

Output rules:
- Return ONLY valid JSON matching the schema below — no markdown, no code fences, no commentary before or after it.
- Omit a field or set it to null if genuinely not applicable — never fabricate a placeholder value.

JSON schema to follow:
{RESPONSE_JSON_SCHEMA_HINT}
"""


# ============================================================================
# GEMINI CALL + RESPONSE EXTRACTION
# ============================================================================

def safe_extract_text(response) -> Optional[str]:
    if not response or not hasattr(response, "candidates"):
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


def extract_json(raw_text: str) -> Dict[str, Any]:
    """Strips markdown fences and any stray leading/trailing text, then
    parses. More defensive than a plain startswith/endswith fence strip —
    handles cases where the model adds a sentence before/after the JSON."""
    text = raw_text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise HTTPException(status_code=502, detail="AI response was not valid JSON")

    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse AI JSON: %s", exc)
        raise HTTPException(status_code=502, detail=f"AI response could not be parsed: {exc}") from exc


def normalize_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Repairs the raw parsed dict before Pydantic validation:
    - drops/ignores anything the AI wrongly included from SERVER_OWNED_FIELDS
      (the server will set these itself afterward, so stray AI values here
      are just discarded rather than causing a mismatch)
    - unknown top-level keys get funneled into additional_information
      instead of causing a hard failure
    - invalid/hallucinated activity_type values are coerced to null
      rather than rejecting the whole response
    """
    known_keys = set(ItineraryResponse.model_fields.keys())
    for field in SERVER_OWNED_FIELDS:
        data.pop(field, None)

    extras = {k: v for k, v in data.items() if k not in known_keys}
    for key in extras:
        data.pop(key, None)
    if extras:
        existing_extra = data.get("additional_information") or {}
        existing_extra.update(extras)
        data["additional_information"] = existing_extra

    for day in data.get("itinerary", []) or []:
        for block in day.get("blocks", []) or []:
            if block.get("activity_type") not in ALLOWED_ACTIVITY_TYPES:
                block["activity_type"] = None

    return data


def format_budget_display(breakdown: Optional[dict], budget_tier: str) -> Optional[str]:
    if breakdown and breakdown.get("total"):
        return f"~₹{breakdown['total']:,.0f}"
    return budget_tier.title() if budget_tier else None


# ============================================================================
# MAIN GENERATION ENDPOINT (v3.0)
# ============================================================================

@router.post("/api/itinerary", response_model=ItineraryResponse)
async def generate_itinerary(config: ItineraryRequest):
    """
    1. Build the travel-consultant prompt (content only — no known facts)
    2. Call Gemini
    3. Extract + repair the JSON
    4. Inject destination/source/days/travel_mode/overall_style deterministically
    5. Validate against schemas.itinerary.ItineraryResponse
    6. Compute trip_stats and return
    """
    try:
        prompt = build_gemini_prompt(config)

        model_name = MODEL_MAP.get(config.ai_model, MODEL_MAP["standard"])
        logger.info(
            "Itinerary generation requested: tier=%s resolved_model=%s destination=%s days=%s",
            config.ai_model, model_name, config.trip_summary.destination, config.trip_summary.days,
        )

        if config.ai_model in PRO_TIER_ALIASES:
            check_and_increment_pro_usage()

        model = genai.GenerativeModel(model_name)
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.6,
                max_output_tokens=16000,
                response_mime_type="application/json",
            ),
        )

        raw_text = safe_extract_text(response)
        if not raw_text:
            raise HTTPException(status_code=502, detail="Gemini returned an empty response")

        data = extract_json(raw_text)
        data = normalize_response(data)

        # --- Inject server-owned facts (never trust the AI for these) ---
        data["destination"] = config.trip_summary.destination
        data["source"] = config.trip_summary.source
        data["days"] = config.trip_summary.days
        data["travel_mode"] = config.trip_summary.travel_mode
        data["group_type"] = "family" if config.optional_constraints.family_friendly else None
        data["overall_style"] = OverallStyle(
            pace=config.constraints.pace,
            budget=config.constraints.budget,
            experience_style=config.constraints.experience_style,
            comfort_level=config.constraints.comfort_level,
        ).model_dump()

        try:
            itinerary = ItineraryResponse(**data)
        except Exception as exc:
            logger.error("Itinerary failed schema validation: %s", exc)
            raise HTTPException(
                status_code=502,
                detail="The generated itinerary was incomplete or malformed. Please try again.",
            ) from exc

        if len(itinerary.itinerary) != config.trip_summary.days:
            logger.warning(
                "Day count mismatch: requested %s, got %s",
                config.trip_summary.days, len(itinerary.itinerary),
            )
            raise HTTPException(
                status_code=502,
                detail="The generated itinerary did not match the requested trip length. Please try again.",
            )

        # --- Compute trip_stats deterministically, not from the AI ---
        places_covered = sum(len(day.blocks) for day in itinerary.itinerary)
        itinerary.trip_stats = TripStats(
            distance_km=config.trip_summary.distance_km,
            places_covered=places_covered,
            estimated_budget_display=format_budget_display(
                itinerary.budget_breakdown.model_dump() if itinerary.budget_breakdown else None,
                config.constraints.budget,
            ),
        )

        logger.info(
            "Itinerary generated successfully: tier=%s model=%s destination=%s days=%s places_covered=%s",
            config.ai_model, model_name, config.trip_summary.destination, config.trip_summary.days, places_covered,
        )

        return itinerary

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Unexpected error in itinerary generation")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during itinerary generation. Please try again.",
        ) from exc


# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/itinerary/health")
async def itinerary_health():
    return {
        "status": "ok",
        "service": "itinerary_generation_v3",
        "endpoint": "/api/itinerary",
        "schema_version": "3.0",
        "features": [
            "full_travel_guide",
            "flexible_time_blocks",
            "day_themes_and_summaries",
            "activity_typing_aligned_to_frontend",
            "enhanced_meal_info",
            "photography_notes",
            "logistics_hints",
            "weather_budget_food_shopping_sections",
            "deterministic_trip_facts",
        ],
        "supported_models": ["flash_lite", "flash", "flash_plus"],
        "max_days": 30,
        "dependencies": ["Module 5 configuration"],
    }