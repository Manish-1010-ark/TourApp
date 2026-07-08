# routes/usage_routes.py
"""
Tiny router exposing current 'pro' tier usage so AIModelSelector can show
a live "{remaining} left" badge on page load, before any generation has
happened this session.

Wire this up in your main app with:
    from routes.usage_routes import router as usage_router
    app.include_router(usage_router)

(Not added automatically here since the main app file wasn't provided —
this is a self-contained addition, nothing existing needs to change.)
"""

from fastapi import APIRouter
from services.usage_tracker import get_pro_usage_stats

router = APIRouter()


@router.get("/api/usage")
def get_usage():
    return get_pro_usage_stats()