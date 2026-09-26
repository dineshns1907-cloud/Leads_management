from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.services.activity_service import activity_service
from app.core.security import get_current_user

router = APIRouter(tags=["Activities"])

@router.get("/leads/{lead_id}/activities", response_model=List[ActivityResponse], summary="Get chronological activities for a lead")
def get_lead_activities(
    lead_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns interaction history for a specific lead ordered with newest events first.
    """
    return activity_service.get_lead_activities(db=db, lead_id=lead_id, limit=limit)

@router.post("/leads/{lead_id}/activities", response_model=ActivityResponse, status_code=status.HTTP_201_CREATED, summary="Log a customer activity or touchpoint")
def create_lead_activity(
    lead_id: str,
    activity_in: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Logs an interaction (call, email, demo, quotation, etc.), triggers automatic score recalculation,
    and updates lead activity clock.
    """
    return activity_service.create_activity(db=db, lead_id=lead_id, activity_in=activity_in, user_id=current_user.id)

@router.get("/activities", response_model=List[ActivityResponse], summary="Global activity audit stream")
def get_all_activities(
    activity_type: Optional[str] = Query(None, description="CALL, EMAIL, DEMO, QUOTATION, PROPOSAL, etc."),
    lead_id: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Audit stream across the entire sales organization with multi-parameter filtering.
    """
    return activity_service.get_all_activities(
        db=db,
        activity_type=activity_type,
        lead_id=lead_id,
        user_id=user_id,
        date_from=date_from,
        date_to=date_to,
        limit=limit
    )
