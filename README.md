# 🧭 Smart Travel & Tourism Web App  

A modular, AI-assisted travel planning system focused on realistic, constraint-based itinerary generation for India.  
This project separates backend intelligence from frontend experience, enabling parallel development without conflicts.

---

## 🏗️ Architecture Overview  
```
Backend (FastAPI) → Stable APIs → Frontend (React)
```
- **Backend is the source of truth** – all logic resides here.  
- **Frontend only consumes APIs** – no business logic duplication.

---

## 🧠 Backend Modules  
| Module | Description |
|--------|-------------|
| **Location Discovery** | India-only cities, prevents invalid/fictional locations |
| **Route Feasibility Validation** | Distance calculation, feasibility check, min. recommended days |
| **Travel Mode & Time Estimation** | Flight/Train/Bus/Car support, travel time estimation |
| **Trip Configuration & Intent Locking** | Pace, budget, AI-assisted interest selection, optional constraints |
| **AI Itinerary Generation** | Gemini-powered, constraint-aware, day-wise structured output |

---

## 🧰 Tech Stack  
**Backend:** FastAPI, Pydantic, Google Gemini API  
**Frontend:** React, Vite, Tailwind CSS  

---

## 📁 Repository Structure  
```
TourApp/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── docs/             # API contracts & documentation
├── .gitignore
└── README.md
```

---

## ⚙️ Setup Instructions  

### Prerequisites  
- Python 3.9+  
- Node.js 18+  
- Google Gemini API Key  

---

### 🔧 Backend Setup  
1. Navigate to the backend directory:  
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:  
   ```bash
   python -m venv venv
   ```
   - **Windows:** `venv\Scripts\activate`  
   - **Linux/Mac:** `source venv/bin/activate`

3. Install dependencies:  
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:  
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google Gemini API key.

5. Run the backend server:  
   ```bash
   uvicorn main:app --reload
   ```
   - API docs (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  
   - Base URL: `http://127.0.0.1:8000`

---

### 🎨 Frontend Setup  
1. Switch to the frontend development branch:  
   ```bash
   git checkout frontend-dev
   ```

2. Navigate to the frontend directory:  
   ```bash
   cd frontend
   ```

3. Install dependencies:  
   ```bash
   npm install
   ```

4. Start the development server:  
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:5173` by default.

---

## 🔀 Git Workflow Rules  
**Branches:**  
- `main` → Backend stable (managed by backend owner)  
- `frontend-dev` → Frontend development branch  

**Rules:**  
✅ Commit frontend changes only to `frontend-dev`  
✅ Sync regularly with `main` to avoid drift  
❌ Never commit `.env` files  
❌ Never push directly to `main`  
❌ Do not modify backend logic from frontend branch  

---

## 🔐 Security & Environment  
- API keys are stored in `.env` (git-ignored).  
- Use `.env.example` as a reference.  
- Never share or commit actual credentials.

---

## 📌 Important Notes for Teammates  
- Backend logic is **final and validated**.  
- **Swagger UI** (`/docs`) is the single source of API truth.  
- If an API response seems incorrect, **do not** implement frontend workarounds.  
- Report backend issues directly to the maintainer.

---

## 👤 Maintainer  
**Backend & System Architecture:** [Your Name]  
**Frontend Development:** Handled independently by frontend team members.

---

## ✅ Current Status  
- Backend modules 1–6 complete ✅  
- APIs verified via Swagger ✅  
- AI failure handling implemented ✅  
- Ready for frontend UI/UX implementation ✅  

---

## ❓ Need Help?  
- For backend issues: Contact backend maintainer.  
- For frontend issues: Discuss in the frontend team channel.  
- Always refer to `docs/api-contracts.md` for API specifications.

---

Let’s build something amazing together! 🚀
