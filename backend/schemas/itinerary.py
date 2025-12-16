from pydantic import BaseModel
from typing import List

class TimeBlock(BaseModel):
    title: str
    description: str

class DayPlan(BaseModel):
    day: int
    morning: TimeBlock
    afternoon: TimeBlock
    evening: TimeBlock

class ItineraryResponse(BaseModel):
    destination: str
    days: int
    itinerary: List[DayPlan]
