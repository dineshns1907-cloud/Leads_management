from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.activity import ActivityType

class ActivityBase(BaseModel):
    activity_type: ActivityType
    description: str = Field(..., min_length=1)
    activity_date: Optional[datetime] = None
    activity_metadata: Optional[Dict[str, Any]] = None

class ActivityCreate(ActivityBase):
    pass

class ActivityResponse(BaseModel):
    id: str
    lead_id: str
    lead_public_id: Optional[str] = None
    user_id: Optional[str] = None
    sales_rep_name: Optional[str] = None
    lead_company_name: Optional[str] = None
    activity_type: str
    description: str
    activity_date: datetime
    activity_metadata: Optional[Dict[str, Any]] = None
    score_impact: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
