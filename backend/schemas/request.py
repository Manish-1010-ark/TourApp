from pydantic import BaseModel, Field
from typing import List

class ItineraryRequest(BaseModel):
    destination: str = Field(..., min_length=1, description="Travel destination")
    interests: List[str] = Field(..., min_items=1, description="List of user interests")
    model: str = Field(default="flash", description="AI model choice: 'flash' or 'flash_plus'")
    
    class Config:
        schema_extra = {
            "example": {
                "destination": "Goa",
                "interests": ["beaches", "local_food", "nightlife"],
                "model": "flash"
            }
        }
