from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.score import LeadScoreResponse, ScoreRecalculateResponse, ScoreFactor
from app.services.scoring_service import scoring_service
from app.core.security import get_current_user

router = APIRouter(prefix="/leads", tags=["AI Scoring"])

@router.get("/{lead_id}/score", response_model=LeadScoreResponse, summary="Get lead AI score and contributor breakdown")
def get_lead_score(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns explainable AI scoring breakdown: positive momentum factors, risk friction deductions,
    and conversion probability.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    score_obj = scoring_service.get_latest_score(db, lead_id)
    raw_factors = score_obj.score_factors or {}
    pos = [ScoreFactor(**f) for f in raw_factors.get("positive_factors", [])]
    neg = [ScoreFactor(**f) for f in raw_factors.get("negative_factors", [])]

    return LeadScoreResponse(
        id=score_obj.id,
        lead_id=score_obj.lead_id,
        score=score_obj.score,
        conversion_probability=score_obj.conversion_probability,
        classification=score_obj.classification,
        engagement_level=score_obj.engagement_level,
        positive_score=score_obj.positive_score,
        negative_score=score_obj.negative_score,
        positive_factors=pos,
        negative_factors=neg,
        calculated_at=score_obj.calculated_at
    )

@router.post("/{lead_id}/score/recalculate", response_model=ScoreRecalculateResponse, summary="Force recalculate lead AI score")
def recalculate_score(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Runs the behavioral engine against all recorded events to compute updated momentum and decay weights.
    """
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    prev_score_obj = lead.latest_score
    prev_score = prev_score_obj.score if prev_score_obj else 50

    new_score_obj = scoring_service.calculate_score_for_lead(db, lead, persist=True)

    raw_factors = new_score_obj.score_factors or {}
    pos = [ScoreFactor(**f) for f in raw_factors.get("positive_factors", [])]
    neg = [ScoreFactor(**f) for f in raw_factors.get("negative_factors", [])]

    return ScoreRecalculateResponse(
        lead_id=lead_id,
        previous_score=prev_score,
        new_score=new_score_obj.score,
        score_change=new_score_obj.score - prev_score,
        conversion_probability=new_score_obj.conversion_probability,
        classification=new_score_obj.classification,
        engagement_level=new_score_obj.engagement_level,
        positive_factors=pos,
        negative_factors=neg,
        recalculated_at=new_score_obj.calculated_at
    )
