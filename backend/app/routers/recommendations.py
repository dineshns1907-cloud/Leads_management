from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.lead import Lead
from app.models.pipeline import LeadStatus
from app.models.user import User
from app.schemas.recommendation import RecommendationResponse, FocusLeadResponse
from app.services.recommendation_service import recommendation_service
from app.core.security import get_current_user

router = APIRouter(prefix="/recommendations", tags=["AI Recommendations"])

@router.get("", response_model=List[RecommendationResponse], summary="Get AI-recommended next actions")
def get_recommendations(
    priority: Optional[str] = Query(None, description="immediate, today, this_week"),
    category: Optional[str] = Query(None, description="Contact, Follow-up, Demo, Proposal, Nurture"),
    lead_id: Optional[str] = Query(None),
    owner_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns prioritized sales actions determined by deal momentum, document opens,
    and stage stagnation. Excludes closed deals.
    """
    query = db.query(Lead).filter(Lead.status == LeadStatus.ACTIVE.value)
    if lead_id:
        query = query.filter(Lead.id == lead_id)
    if owner_id:
        query = query.filter(Lead.owner_id == owner_id)

    leads = query.all()
    results = []

    for lead in leads:
        score_obj = lead.latest_score
        score_val = score_obj.score if score_obj else 50
        prob_val = score_obj.conversion_probability if score_obj else 0.50

        rec_info = recommendation_service.generate_recommendation_for_lead(lead, score_val, prob_val)

        if priority and priority.lower() != "all" and rec_info["urgency"] != priority.lower():
            continue
        if category and category.lower() != "all" and rec_info["category"].lower() != category.lower():
            continue

        results.append(RecommendationResponse(
            id=f"rec-{lead.id}",
            lead_id=lead.id,
            company_name=lead.company_name,
            contact_name=lead.contact_name,
            contact_role=lead.contact_role,
            ai_score=score_val,
            conversion_probability=prob_val,
            action=rec_info["action"],
            recommended_action=rec_info["action"],
            reason=rec_info["reason"],
            urgency=rec_info["urgency"],
            category=rec_info["category"],
            completed=False,
            last_touch="Today",
            created_at=datetime.now(timezone.utc)
        ))

    # Sort by urgency (immediate first) and score desc
    def sort_key(item: RecommendationResponse):
        urgency_score = 3 if item.urgency == "immediate" else (2 if item.urgency == "today" else 1)
        return (urgency_score, item.ai_score or 0)

    results.sort(key=sort_key, reverse=True)
    return results

@router.get("/focus", response_model=List[FocusLeadResponse], summary="Focus Mode: High-priority opportunities")
def get_focus_leads(
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Returns leads requiring immediate representative attention:
    - Score >= 80 (HOT)
    - Active proposal/negotiation with high engagement
    - Stage stagnation (> 6 days without movement)
    - Recent pricing or quotation request
    """
    return recommendation_service.get_focus_leads(db=db, limit=limit)

@router.put("/{rec_id}/complete", summary="Mark recommendation as completed")
@router.post("/{rec_id}/complete", summary="Mark recommendation as completed")
def complete_recommendation(
    rec_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Marks an AI recommendation as completed in the database.
    """
    from app.models.recommendation import Recommendation
    rec = db.query(Recommendation).filter(Recommendation.id == rec_id).first()
    if rec:
        rec.completed = True
        db.commit()
    else:
        # Check if rec_id maps to a lead_id (e.g. rec-lead-123)
        lead_id = rec_id.replace("rec-", "")
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if lead:
            new_rec = Recommendation(
                id=rec_id,
                lead_id=lead.id,
                action="Sales action executed",
                reason="Representative completed recommended action",
                completed=True
            )
            db.add(new_rec)
            db.commit()

    return {"status": "completed", "id": rec_id, "message": "Recommendation marked as completed in database"}

