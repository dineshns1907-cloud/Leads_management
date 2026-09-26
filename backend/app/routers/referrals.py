from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.referral import ReferralCreate, ReferralUpdate, ReferralResponse, ReferralSummaryResponse, CustomerOption
from app.services.referral_service import referral_service

router = APIRouter(prefix="/referrals", tags=["Referrals & Rewards"])

@router.get("", response_model=List[ReferralResponse], summary="List all customer referrals")
def list_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns full list of referrals with status and rewards.
    """
    return referral_service.get_all_referrals(db)

@router.get("/summary", response_model=ReferralSummaryResponse, summary="Get referral program KPI metrics")
def get_referral_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns aggregated referral metrics: total, pending, eligible, and granted rewards.
    """
    return referral_service.get_referral_summary(db)

@router.get("/customers", response_model=List[CustomerOption], summary="Get existing customer list for Referred By dropdown")
def get_customer_options(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns existing customer accounts to select as referrer when adding a lead with source Referral.
    """
    return referral_service.get_customer_options(db)

@router.post("", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED, summary="Create a new referral")
def create_referral(
    payload: ReferralCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Links a newly added lead to an existing customer referrer.
    """
    ref = referral_service.create_referral(
        db=db,
        referrer_customer_id=payload.referrer_customer_id,
        referred_lead_id=payload.referred_lead_id,
        reward_type=payload.reward_type or "PERCENTAGE_DISCOUNT",
        reward_value=payload.reward_value or 10.0,
        notes=payload.notes
    )
    return referral_service._build_referral_response(ref)

@router.get("/{referral_id}", response_model=ReferralResponse, summary="Get single referral detail")
def get_referral(
    referral_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return referral_service.get_referral_by_id(db, referral_id)

@router.post("/{referral_id}/grant", response_model=ReferralResponse, summary="Grant reward for an eligible referral")
def grant_referral_reward(
    referral_id: str,
    note: Optional[str] = Query(None, description="Optional note regarding reward issuance"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Changes referral status to REWARD_GRANTED and records completion.
    """
    return referral_service.grant_reward(db, referral_id, note)
