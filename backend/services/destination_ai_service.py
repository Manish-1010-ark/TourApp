import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))


def generate_destination_description(place_name: str):
    """
    Generate a short tourist-friendly description.
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

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    print(generate_destination_description("Jama Masjid"))