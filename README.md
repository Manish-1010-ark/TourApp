🧭 Smart Travel & Tourism Web App

A modular, AI-assisted travel planning system focused on realistic, constraint-based itinerary generation for India.

This project separates backend intelligence from frontend experience, allowing parallel development without conflicts.

🏗️ Project Architecture (High Level)
Backend (FastAPI)  →  Stable APIs  →  Frontend (React)


The backend is the source of truth.
Frontend must not duplicate logic present in backend modules.

🧠 Core Backend Modules

Location Discovery

India-only cities

Prevents invalid or fictional locations

Route Feasibility Validation

Distance calculation

Feasibility check (Yes / No)

Minimum recommended days

Travel Mode & Time Estimation

Flight / Train / Bus / Car

Estimated travel time

Preferred mode validation

Trip Configuration & Intent Locking

Travel pace

Budget tier

AI-assisted interest selection

Optional constraints

AI model selection

AI Itinerary Generation

Gemini-powered

Consumes validated constraints only

Returns structured day-wise itinerary

🧰 Tech Stack
Backend

FastAPI (Python)

Pydantic

Google Gemini API

Frontend

React

Vite

Tailwind CSS

📁 Repository Structure
TourApp/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── location_routes.py
│   │   ├── route_validation.py
│   │   ├── travel_modes.py
│   │   ├── trip_config.py
│   │   └── itinerary.py
│   └── utils/
│       └── gemini_helpers.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   └── api-contracts.md
│
├── .gitignore
└── README.md

⚙️ Backend Setup (For Testing & API Use)

Required for anyone testing APIs or integrating frontend.

cd backend
python -m venv venv

Activate virtual environment
# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

Install dependencies
pip install -r requirements.txt

Environment variables
cp .env.example .env
# Add your Google Gemini API key inside .env

Run backend
uvicorn main:app --reload

Swagger API Docs
http://127.0.0.1:8000/docs

🎨 Frontend Development (TEAM INSTRUCTIONS)

Frontend developers should not modify backend code.

Steps:
git checkout frontend-dev
cd frontend
npm install
npm run dev

Backend APIs

Base URL: http://127.0.0.1:8000

API documentation available in Swagger (/docs)

Follow request/response schemas strictly

🔀 Git Workflow Rules (IMPORTANT)
Branches

main → Backend stable (maintained by backend owner)

frontend-dev → Frontend development (team branch)

Rules

❌ Do NOT commit .env

❌ Do NOT push directly to main

❌ Do NOT modify backend logic from frontend branch

✅ Commit frontend changes only to frontend-dev

🔐 Environment & Security

API keys are stored in .env

.env is ignored by Git

Use .env.example as reference only

📌 Important Notes for Teammates

Backend logic is final and validated

Swagger is the single source of API truth

If an API response looks wrong, do not “fix” it in frontend

Report backend issues instead of working around them

👤 Maintainer

Backend & System Architecture:
Maintained by [Your Name]

Frontend development handled independently by team members.

✅ Current Status

Backend modules 1–6 complete

APIs verified in Swagger

AI failures handled safely

Ready for frontend UI/UX implementation