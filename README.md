# Smart Travel & Tourism Web App

This project is a modular, AI-assisted travel itinerary planner focused on realistic travel planning.

## Tech Stack
- Backend: FastAPI (Python)
- Frontend: React + Vite + Tailwind
- AI: Google Gemini

## Backend Modules
1. Location Discovery (India-only cities)
2. Route Feasibility Validation
3. Travel Mode & Time Estimation
4. Trip Configuration & Intent Locking
5. AI Itinerary Generation

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload

Open Swagger at:
http://127.0.0.1:8000/docs

