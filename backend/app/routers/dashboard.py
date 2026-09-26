from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.analytics import DashboardResponse
from app.services.analytics_service import analytics_service
from app.core.security import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardResponse, summary="Aggregated executive dashboard data")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns single consolidated payload for the dashboard view to minimize frontend roundtrips:
    KPIs, priority queue, pipeline summary, AI insights, recent activities, and recommendations.
    """
    return analytics_service.get_dashboard(db, user=current_user)
