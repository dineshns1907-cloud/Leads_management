from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.pipeline import PipelineStage, LeadStatus, StagnationStatus
from app.schemas.activity import ActivityResponse
from app.schemas.note import NoteResponse
from app.schemas.score import ScoreBreakdown

class LeadBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    contact_name: str = Field(..., min_length=2, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    industry: str
    company_size: Optional[str] = None
    location: Optional[str] = None
    contact_role: Optional[str] = None
    lead_source: str
    estimated_value: float = Field(default=0.0, ge=0)
    expected_investment: Optional[float] = None
    stage: PipelineStage = PipelineStage.NEW
    status: LeadStatus = LeadStatus.ACTIVE
    owner_id: Optional[str] = None
    referred_by_id: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    contact_role: Optional[str] = None
    lead_source: Optional[str] = None
    estimated_value: Optional[float] = None
    expected_investment: Optional[float] = None
    stage: Optional[PipelineStage] = None
    status: Optional[LeadStatus] = None
    owner_id: Optional[str] = None
    referred_by_id: Optional[str] = None

class LeadStageUpdate(BaseModel):
    stage: PipelineStage
    note: Optional[str] = None

class LeadResponse(BaseModel):
    id: str
    public_lead_id: Optional[str] = None
    company_name: str
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    industry: str
    company_size: Optional[str] = None
    location: Optional[str] = None
    contact_role: Optional[str] = None
    lead_source: str
    estimated_value: float
    expected_investment: float = 0.0
    expected_investment_formatted: str = "₹0"
    stage: str
    status: str
    owner_id: Optional[str] = None
    owner_name: Optional[str] = None
    referred_by_id: Optional[str] = None
    referred_by_company: Optional[str] = None
    
    # AI Scoring & Behavioral Fields
    ai_score: int = 50
    conversion_probability: float = 0.50
    classification: str = "WARM"
    engagement_level: str = "MEDIUM"
    days_in_current_stage: int = 0
    total_days_in_pipeline: int = 0
    stagnation_status: str = "NORMAL"
    recommended_action: Optional[str] = None
    
    # Feature 1: Revenue-Aware Business Priority Score & Tier
    business_priority_score: int = 50
    business_priority_tier: str = "MEDIUM"
    business_priority_factors: List[str] = []

    last_activity_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LeadDetailResponse(LeadResponse):
    score_breakdown: Optional[ScoreBreakdown] = None
    recent_activities: List[ActivityResponse] = []
    notes: List[NoteResponse] = []
    recommended_action_reason: Optional[str] = None
    pipeline_history: List[Dict[str, Any]] = []
    referral_info: Optional[Dict[str, Any]] = None
