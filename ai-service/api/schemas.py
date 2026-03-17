from pydantic import BaseModel
from typing import Optional, Dict, List


class UserStats(BaseModel):
    total_climbs: int
    by_type: Dict[str, int]
    by_grade: Dict[str, int]
    first_try_rate: float
    avg_attempts: float


class ProgressData(BaseModel):
    history: List[Dict[str, int]]
    streak: int
    current_level: int


class Recommendation(BaseModel):
    type: str
    description: str
    reason: str
    confidence: float


class NextGradeRecommendation(BaseModel):
    recommended_grade: str
    suggested_routes: List[str]
    training_focus: str
    estimated_time: str
