# routes/chatbot.py
"""
Module 7: AI Travel Chatbot (floating widget)

This module:
1. Receives user chat messages plus conversation history
2. Calls Gemini for a conversational travel Q&A / recommendations response
3. Returns the assistant's reply

This is a separate, general-purpose Q&A chatbot — independent from the
Gemini-powered itinerary generation in Module 6 (routes/itinerary.py).
It reuses the same GOOGLE_API_KEY but has its own service file, system
prompt, and model config (services/gemini_chat_service.py).
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Literal
from services.gemini_chat_service import get_chat_response

router = APIRouter()

# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., description="Conversation history, oldest first")

class ChatResponse(BaseModel):
    reply: str

# ============================================================================
# MAIN CHAT ENDPOINT
# ============================================================================

@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Generate a conversational reply using DeepSeek.

    Args:
        request: ChatRequest containing the conversation history

    Returns:
        ChatResponse with the assistant's reply

    Raises:
        HTTPException 400: empty message history
        HTTPException 500: DeepSeek API call failed
    """
    if not request.messages or len(request.messages) == 0:
        raise HTTPException(status_code=400, detail="messages cannot be empty")

    try:
        reply = await get_chat_response(
            [msg.model_dump() for msg in request.messages]
        )
        return ChatResponse(reply=reply)

    except ValueError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get chatbot reply: {str(e)}")

    except Exception as e:
        print(f"🔥 Unexpected error in chatbot: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred. Please try again."
        )

# ============================================================================
# HEALTH CHECK
# ============================================================================

@router.get("/api/chat/health")
async def chat_health():
    """Health check for chatbot service"""
    return {
        "status": "ok",
        "service": "travel_chatbot",
        "endpoint": "/api/chat",
        "provider": "gemini"
    }

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

"""
POST /api/chat
{
  "messages": [
    {"role": "user", "content": "What's the best time to visit Goa?"}
  ]
}

To test manually:
curl -X POST http://127.0.0.1:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Best time to visit Goa?"}]}'
"""