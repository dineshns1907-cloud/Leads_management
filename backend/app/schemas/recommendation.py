from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class RecommendationBase(BaseModel):
    lead_id: str
    action: str
    reason: str
    urgency: str = "today" # immediate, today, this_week
    category: str = "Follow-up"

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationResponse(BaseModel):
    id: str
    lead_id: str
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_role: Optional[str] = None
    ai_score: Optional[int] = None
    conversion_probability: Optional[float] = None
    action: str
    recommended_action: Optional[str] = None
    reason: str
    urgency: str
    category: str
    completed: bool
    last_touch: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FocusLeadResponse(BaseModel):
    lead_id: str
    company_name: str
    contact_name: str
    contact_role: Optional[str] = None
    industry: str
    estimated_value: float
    stage: str
    score: int
    conversion_probability: float
    probability: Optional[float] = None
    classification: str
    engagement_level: str
    stagnation_status: str
    days_in_current_stage: int
    focus_reason: str
    reason: Optional[str] = None
    recommended_action: str
    urgency: str
    lead: Optional[Dict[str, Any]] = None
