# schemas/request.py
from pydantic import BaseModel, Field
from typing import List


class TripSummary(BaseModel):
    """Trip summary from Module 5 — treated as ground truth, never re-derived by the AI."""
    source: str
    destination: str
    distance_km: float
    travel_mode: str
    days: int = Field(..., ge=1, le=30)


class Constraints(BaseModel):
    """Constraints from Module 5."""
    pace: str
    places_per_day: int
    start_time: str
    budget: str  # free-form (e.g. "premium", "budget") — owned by Module 5, not constrained here
    experience_style: str
    comfort_level: str


class OptionalConstraints(BaseModel):
    """Optional preferences from Module 5."""
    avoid_early_mornings: bool = False
    prefer_less_walking: bool = False
    family_friendly: bool = False
    vegetarian_friendly: bool = False
    photography_focus: bool = False


class ItineraryRequest(BaseModel):
    """Complete configuration from Module 5. This is the ONLY definition —
    routes/itinerary_route.py imports this rather than redeclaring it."""
    trip_summary: TripSummary
    constraints: Constraints
    interests: List[str] = Field(..., min_length=1)
    optional_constraints: OptionalConstraints = Field(default_factory=OptionalConstraints)
    # "standard" or "pro" — the two user-facing tiers. Older values
    # (e.g. "flash", "flash_plus") are still resolved by MODEL_MAP for
    # backward compatibility, but new clients should send these two.
    ai_model: str = "standard"

    model_config = {
        "json_schema_extra": {
            "example": {
                "trip_summary": {
                    "source": "Mumbai",
                    "destination": "Goa",
                    "distance_km": 461,
                    "travel_mode": "train",
                    "days": 3,
                },
                "constraints": {
                    "pace": "balanced",
                    "places_per_day": 3,
                    "start_time": "moderate",
                    "budget": "premium",
                    "experience_style": "balanced",
                    "comfort_level": "comfortable",
                },
                "interests": ["beaches", "local food", "nightlife", "water sports", "heritage sites"],
                "optional_constraints": {
                    "avoid_early_mornings": False,
                    "prefer_less_walking": False,
                    "family_friendly": True,
                    "vegetarian_friendly": True,
                    "photography_focus": True,
                },
                "ai_model": "standard",
            }
        }
    }