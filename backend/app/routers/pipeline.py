from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.models.user import User
from app.schemas.lead import LeadResponse
from app.services.lead_service import lead_service
from app.core.security import get_current_user

router = APIRouter(prefix="/pipeline", tags=["Pipeline"])

@router.get("", summary="Get Kanban pipeline breakdown")
def get_pipeline(
    include_completed: bool = Query(False, description="Include WON and LOST stages"),
    owner_id: Optional[str] = Query(None, description="Filter by salesperson ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns active deals grouped by pipeline stages for the Kanban view,
    including total pipeline value, deal counts, and average AI health scores.
    """
    active_stages = [
        PipelineStage.NEW.value,
        PipelineStage.CONTACTED.value,
        PipelineStage.QUALIFIED.value,
        PipelineStage.DEMO.value,
        PipelineStage.PROPOSAL.value,
        PipelineStage.NEGOTIATION.value
    ]
    if include_completed:
        active_stages.extend([PipelineStage.WON.value, PipelineStage.LOST.value])

    query = db.query(Lead).filter(Lead.stage.in_(active_stages))
    if not include_completed:
        query = query.filter(Lead.status == LeadStatus.ACTIVE.value)
    if owner_id:
        query = query.filter(Lead.owner_id == owner_id)

    leads = query.all()
    grouped_leads: Dict[str, List[LeadResponse]] = {s: [] for s in active_stages}

    total_value = 0.0
    all_scores = []

    for l in leads:
        res = lead_service._build_lead_response(l)
        grouped_leads[l.stage].append(res)
        if l.status == LeadStatus.ACTIVE.value:
            total_value += l.estimated_value
            all_scores.append(res.ai_score)

    # Sort each column by score desc
    for s in active_stages:
        grouped_leads[s].sort(key=lambda x: x.ai_score, reverse=True)

    avg_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 68.0

    if total_value >= 10_000_000:
        formatted_pipeline_val = f"₹{total_value/10_000_000:.1f} Cr".replace(".0 Cr", " Cr")
    elif total_value >= 100_000:
        formatted_pipeline_val = f"₹{total_value/100_000:.1f}L".replace(".0L", "L")
    elif total_value >= 1_000:
        formatted_pipeline_val = f"₹{total_value/1_000:.0f}k"
    else:
        formatted_pipeline_val = f"₹{int(total_value)}"

    return {
        "stages": grouped_leads,
        "lead_count": len(all_scores),
        "pipeline_value": total_value,
        "formatted_pipeline_value": formatted_pipeline_val,
        "average_score": avg_score
    }
