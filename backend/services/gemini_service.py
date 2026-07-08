import google.generativeai as genai
import os
import json
import logging
import re
from dotenv import load_dotenv

logger = logging.getLogger("gemini_service")

# Two user-facing tiers. Keys are the semantic values the frontend sends
# ("standard" / "pro") — no Gemini version numbers exposed to the client.
# Old ai_model values are kept mapped for backward compatibility with any
# in-flight requests or cached frontend builds still sending them.
MODEL_MAP = {
    "standard": "models/gemini-2.5-flash",
    "pro": "models/gemini-2.5-pro",

    # Backward compatibility with previously used ai_model values
    "flash_lite": "models/gemini-2.5-flash",
    "flash": "models/gemini-2.5-flash",
    "flash_plus": "models/gemini-2.5-pro",
    "gemini-flash-latest": "models/gemini-2.5-flash",
    "gemini-2.5-flash": "models/gemini-2.5-flash",
    "gemini-2.5-pro": "models/gemini-2.5-pro",
}

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


def extract_json(text: str) -> str:
    """
    Extract JSON object from AI response text
    Handles markdown code blocks and plain JSON
    """
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)

    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in AI response")
    return match.group(0)


def generate_itinerary(template: dict, interests: list[str], model_choice: str):
    """
    Generate travel itinerary using Gemini AI

    Args:
        template: Template dictionary with destination and themes
        interests: List of user interests
        model_choice: Tier identifier ('standard' or 'pro'); older values
            ('flash', 'flash_plus', etc.) are still accepted for compatibility.

    Returns:
        JSON string containing the generated itinerary

    Raises:
        ValueError: If AI returns invalid or empty response
    """
    model_name = MODEL_MAP.get(model_choice, MODEL_MAP["standard"])

    # Explicit log of what was actually requested vs. what tier it resolved
    # to, at the point generation is kicked off.
    logger.info("Itinerary generation requested: model_choice=%s resolved_model=%s", model_choice, model_name)

    model = genai.GenerativeModel(model_name)

    prompt = f"""
You are a backend service that generates travel itineraries.

Instructions:
- Use the provided template exactly for number of days
- Personalize activities based on user interests: {", ".join(interests)}
- Output ONLY valid JSON
- Do NOT include markdown backticks or explanations
- If unsure, make reasonable assumptions
- Make descriptions engaging and specific

Template:
{json.dumps(template, indent=2)}

Return JSON in this exact structure:
{{
  "destination": "{template['destination']}",
  "days": {template['days']},
  "itinerary": [
    {{
      "day": 1,
      "morning": {{ "title": "Activity Title", "description": "Detailed description" }},
      "afternoon": {{ "title": "Activity Title", "description": "Detailed description" }},
      "evening": {{ "title": "Activity Title", "description": "Detailed description" }}
    }}
  ]
}}

Important: Return ONLY the JSON object, no other text.
"""

    try:
        response = model.generate_content(prompt)

        if not response.candidates:
            raise ValueError("No candidates returned by Gemini API")

        candidate = response.candidates[0]

        if not candidate.content or not candidate.content.parts:
            raise ValueError("Gemini returned empty content")

        text = candidate.content.parts[0].text

        clean_json = extract_json(text)
        json.loads(clean_json)  # raises JSONDecodeError if invalid

        return clean_json

    except Exception as e:
        logger.error("Gemini Service Error: %s", e)
        raise ValueError(f"Failed to generate itinerary: {str(e)}")