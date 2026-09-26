from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsOverview,
    SourceMetric,
    StageMetric,
    EngagementMetric,
    ConversionMetric
)
from app.services.analytics_service import analytics_service
from app.core.security import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview, summary="Executive revenue and pipeline overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns executive KPIs: total CRM leads, active opportunities, won/lost counts,
    win conversion rate, and pipeline value.
    """
    return analytics_service.get_overview(db)

@router.get("/sources", response_model=List[SourceMetric], summary="Acquisition channel volume and conversion")
def get_source_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns acquisition source distribution across marketing and outbound channels.
    """
    return analytics_service.get_source_analytics(db)

@router.get("/stages", response_model=List[StageMetric], summary="Deal volume and ARR by pipeline stage")
def get_stage_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns deal counts and values aggregated across all pipeline stages.
    """
    return analytics_service.get_stage_analytics(db)

@router.get("/engagement", response_model=List[EngagementMetric], summary="Weekly sales interaction volume")
def get_engagement_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns weekly touchpoint volume for calls, emails, and product demonstrations.
    """
    return analytics_service.get_engagement_trends(db)

@router.get("/conversion", response_model=List[ConversionMetric], summary="Monthly win rate trajectory vs benchmark")
def get_conversion_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns monthly actual conversion rates compared against sales quota targets.
    """
    return analytics_service.get_conversion_trends(db)
