from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database.connection import get_db
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings"])

class ScoringWeightsModel(BaseModel):
    pricing_quotation_requested: int = Field(default=18, description="Points added when quotation is requested")
    product_demo_completed: int = Field(default=15, description="Points added when live product demo is completed")
    email_response: int = Field(default=12, description="Points added when prospect replies to email")
    commercial_proposal_opened: int = Field(default=10, description="Points added when commercial proposal document is viewed")
    executive_meeting_booked: int = Field(default=8, description="Points added when meeting is confirmed on calendar")
    pricing_page_visited: int = Field(default=6, description="Points added when high-intent pricing calculator is accessed")
    inactivity_decay: int = Field(default=-12, description="Points deducted after extended stagnation/inactivity")
    followup_unopened_decay: int = Field(default=-8, description="Points deducted when follow-up touchpoint is ignored")
    # Business Priority Weights
    interest_weight: float = Field(default=0.40, description="Weight for AI/engagement interest (default 40%)")
    conversion_weight: float = Field(default=0.30, description="Weight for conversion probability (default 30%)")
    investment_weight: float = Field(default=0.30, description="Weight for expected investment (default 30%)")

from app.services.business_priority_service import (
    get_business_priority_weights,
    get_current_scoring_settings,
    set_current_scoring_settings
)

@router.get("/scoring", response_model=Dict[str, Any], summary="Get AI scoring heuristics and behavioral weights")
def get_scoring_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns configurable behavioral impact weight multipliers for scoring calculation.
    """
    return {
        "status": "success",
        "weights": get_current_scoring_settings(),
        "description": "Configurable behavioral heuristics used by the LeadIQ real-time scoring engine."
    }

@router.put("/scoring", response_model=Dict[str, Any], summary="Update AI scoring weights")
def update_scoring_settings(
    weights: ScoringWeightsModel,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Saves behavioral weights configured by the user/administrator.
    """
    set_current_scoring_settings(weights.model_dump())
    return {
        "status": "success",
        "message": "AI scoring weights successfully saved to backend configuration.",
        "weights": get_current_scoring_settings()
    }
