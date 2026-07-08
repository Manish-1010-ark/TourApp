import os
import traceback
import google.generativeai as genai
from dotenv import load_dotenv
from google.api_core.exceptions import ResourceExhausted, GoogleAPIError

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Shown whenever Gemini can't be reached (quota exhausted, network issue,
# etc.) so the endpoint can still return something useful instead of a 500.
FALLBACK_DESCRIPTION_TEMPLATE = (
    "{place_name} is a popular destination worth exploring. "
    "A detailed description isn't available right now — please check back "
    "again shortly."
)


def generate_destination_description(place_name: str):
    """
    Generate a short tourist-friendly description.

    Never raises: if the Gemini call fails for any reason (quota exhausted,
    transient API error, etc.) a generic fallback string is returned instead,
    so a single AI hiccup doesn't take down the whole /destination/info
    response.
    """

    prompt = f"""
    You are a travel guide.

    Write a concise tourist description for:

    {place_name}

    Rules:
    - Maximum 80 words
    - Mention history/significance
    - Mention what it is famous for
    - Friendly tone
    - Plain text only
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    try:
        response = model.generate_content(prompt)
        print("Gemini response:", response)
        return response.text.strip()

    except ResourceExhausted:
        # Free-tier daily/per-minute quota hit. Log it clearly so it's easy
        # to spot in the logs, but don't propagate — degrade gracefully.
        print(
            f"[destination_ai_service] Gemini quota exhausted while "
            f"generating description for '{place_name}'. Returning fallback."
        )
        return FALLBACK_DESCRIPTION_TEMPLATE.format(place_name=place_name)

    except GoogleAPIError:
        traceback.print_exc()
        return FALLBACK_DESCRIPTION_TEMPLATE.format(place_name=place_name)

    except Exception:
        # Catch-all so any unexpected SDK/network error still degrades
        # instead of bubbling up as a 500 to the frontend.
        traceback.print_exc()
        return FALLBACK_DESCRIPTION_TEMPLATE.format(place_name=place_name)


if __name__ == "__main__":
    print(generate_destination_description("Jama Masjid"))