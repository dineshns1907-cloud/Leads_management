from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

class ScoreFactor(BaseModel):
    factor: str
    impact: int

class ScoreBreakdown(BaseModel):
    score: int
    conversion_probability: float
    classification: str
    engagement_level: str
    positive_factors: List[ScoreFactor] = []
    negative_factors: List[ScoreFactor] = []
    explanation: Optional[str] = None

class LeadScoreResponse(BaseModel):
    id: str
    lead_id: str
    score: int
    conversion_probability: float
    classification: str
    engagement_level: str
    positive_score: int
    negative_score: int
    positive_factors: List[ScoreFactor] = []
    negative_factors: List[ScoreFactor] = []
    calculated_at: datetime

    class Config:
        from_attributes = True

class ScoreRecalculateResponse(BaseModel):
    lead_id: str
    previous_score: int
    new_score: int
    score_change: int
    conversion_probability: float
    classification: str
    engagement_level: str
    positive_factors: List[ScoreFactor] = []
    negative_factors: List[ScoreFactor] = []
    recalculated_at: datetime
