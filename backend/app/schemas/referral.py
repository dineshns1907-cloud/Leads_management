from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

class ReferralCreate(BaseModel):
    referrer_customer_id: str = Field(..., description="ID of existing customer lead referring the new prospect")
    referred_lead_id: str = Field(..., description="ID of the newly created lead")
    reward_type: Optional[str] = Field(default="PERCENTAGE_DISCOUNT")
    reward_value: Optional[float] = Field(default=10.0)
    notes: Optional[str] = None

class ReferralUpdate(BaseModel):
    status: Optional[str] = None
    reward_type: Optional[str] = None
    reward_value: Optional[float] = None
    reward_status: Optional[str] = None
    notes: Optional[str] = None

class ReferralResponse(BaseModel):
    id: str
    referrer_customer_id: str
    referrer_company_name: str
    referrer_public_lead_id: Optional[str] = None
    referred_lead_id: str
    referred_company_name: str
    referred_public_lead_id: Optional[str] = None
    referred_contact_name: Optional[str] = None
    referral_date: datetime
    status: str
    reward_type: str
    reward_value: float
    reward_status: str
    deal_value: float
    deal_value_formatted: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReferralSummaryResponse(BaseModel):
    total_referrals: int
    pending_referrals: int
    reward_eligible_referrals: int
    rewards_granted_count: int
    rewards_granted_amount_formatted: str
    recent_referrals: List[ReferralResponse]

class CustomerOption(BaseModel):
    id: str
    public_lead_id: Optional[str] = None
    company_name: str
    contact_name: str
    stage: str
