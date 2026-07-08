# services/gemini_chat_service.py
"""
Gemini API integration for the general travel Q&A chatbot (floating widget).

This is intentionally separate from routes/itinerary.py's Gemini usage,
which powers structured itinerary generation. This service:
- Uses its own system prompt (conversational Q&A tone, not JSON generation)
- Uses a lightweight chat model
- Maintains conversation history via Gemini's chat session, not a one-shot prompt

Same GOOGLE_API_KEY is reused since it's already configured and working.
"""

import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Lightweight, fast model — good fit for short conversational replies.
CHAT_MODEL = "gemini-2.0-flash-lite"

SYSTEM_PROMPT = """You are a friendly, knowledgeable travel assistant embedded in the TourApp travel planning app.
You help users with destination recommendations, general travel advice, packing tips,
local customs, best times to visit, and answering travel-related questions.
Keep answers concise, warm, and practical. If a user asks to book flights/hotels or
generate a full itinerary, gently point them to the app's itinerary generation and
trip configuration features rather than trying to do it yourself."""


def _to_gemini_role(role: str) -> str:
    """Gemini chat history uses 'model' instead of 'assistant'."""
    return "model" if role == "assistant" else "user"


async def get_chat_response(messages: list[dict]) -> str:
    """
    Send conversation history to Gemini and return the assistant's reply.

    Args:
        messages: list of {"role": "user"|"assistant", "content": str}, oldest first

    Returns:
        The assistant's reply text

    Raises:
        ValueError: if the API key is missing, messages are empty, or the call fails
    """
    if not os.getenv("GOOGLE_API_KEY"):
        raise ValueError("GOOGLE_API_KEY is not set in environment (.env)")

    if not messages:
        raise ValueError("messages cannot be empty")

    # Everything except the latest message becomes prior chat history;
    # the latest message is sent as the new turn.
    history = [
        {"role": _to_gemini_role(m["role"]), "parts": [m["content"]]}
        for m in messages[:-1]
    ]
    latest_message = messages[-1]["content"]

    try:
        model = genai.GenerativeModel(CHAT_MODEL, system_instruction=SYSTEM_PROMPT)
        chat = model.start_chat(history=history)

        response = chat.send_message(
            latest_message,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
            ),
        )
        reply = response.text

    except Exception as e:
        print(f"🔥 Gemini chat error: {e}")
        raise ValueError(f"Gemini API call failed: {str(e)}")

    if not reply:
        raise ValueError("Gemini returned an empty response")

    return reply