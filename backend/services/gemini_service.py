import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
import re

MODEL_MAP = {
    "flash": "models/gemini-flash-latest",
    "flash_plus": "models/gemini-2.5-flash"
}

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def extract_json(text: str) -> str:
    """
    Extract JSON object from AI response text
    Handles markdown code blocks and plain JSON
    """
    # Remove markdown code blocks if present
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    
    # Try to find JSON object
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
        model_choice: Model identifier ('flash' or 'flash_plus')
    
    Returns:
        JSON string containing the generated itinerary
    
    Raises:
        ValueError: If AI returns invalid or empty response
    """
    model_name = MODEL_MAP.get(model_choice, MODEL_MAP["flash"])
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
        
        # Safety checks
        if not response.candidates:
            raise ValueError("No candidates returned by Gemini API")

        candidate = response.candidates[0]

        if not candidate.content or not candidate.content.parts:
            raise ValueError("Gemini returned empty content")

        text = candidate.content.parts[0].text
        
        # Extract and clean JSON
        clean_json = extract_json(text)
        
        # Validate JSON is parseable
        json.loads(clean_json)  # This will raise JSONDecodeError if invalid
        
        return clean_json
    
    except Exception as e:
        print(f"🔥 Gemini Service Error: {e}")
        raise ValueError(f"Failed to generate itinerary: {str(e)}")