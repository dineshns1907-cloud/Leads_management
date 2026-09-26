from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadDetailResponse, LeadStageUpdate
from app.services.lead_service import lead_service
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.get("", response_model=List[LeadResponse], summary="List and filter sales leads")
def list_leads(
    response: Response,
    search: Optional[str] = Query(None, description="Search company, contact, or email"),
    stage: Optional[str] = Query(None, description="Filter by stage (e.g. DEMO, PROPOSAL)"),
    source: Optional[str] = Query(None, description="Filter by lead source"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    score_min: Optional[int] = Query(None, ge=0, le=100, description="Minimum AI score"),
    score_max: Optional[int] = Query(None, ge=0, le=100, description="Maximum AI score"),
    classification: Optional[str] = Query(None, description="HOT, WARM, NURTURE, COLD"),
    engagement: Optional[str] = Query(None, description="HIGH, MEDIUM, LOW"),
    owner_id: Optional[str] = Query(None, description="Filter by sales representative ID"),
    status: Optional[str] = Query(None, description="ACTIVE, WON, LOST"),
    sort_by: str = Query("score", description="score, value, days, company, created"),
    sort_order: str = Query("desc", description="asc or desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Search and filter leads across pipeline stages, scoring bands, and owner assignments.
    """
    leads, total_count = lead_service.get_leads(
        db=db,
        search=search,
        stage=stage,
        source=source,
        industry=industry,
        score_min=score_min,
        score_max=score_max,
        classification=classification,
        engagement=engagement,
        owner_id=owner_id,
        status_filter=status,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size
    )
    response.headers["X-Total-Count"] = str(total_count)
    response.headers["X-Page"] = str(page)
    response.headers["X-Page-Size"] = str(page_size)
    return leads

@router.get("/{lead_id}", response_model=LeadDetailResponse, summary="Get lead intelligence dossier")
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetches complete intelligence dossier: scoring breakdown, timeline activities, notes, and recommendations.
    """
    return lead_service.get_lead_by_id(db, lead_id)

@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED, summary="Create a new lead")
def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new lead, calculates baseline score, and records initial pipeline entry activity.
    """
    return lead_service.create_lead(db, lead_in, owner_id=current_user.id)

@router.put("/{lead_id}", response_model=LeadResponse, summary="Update lead information")
def update_lead(
    lead_id: str,
    lead_update: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates contact information, stage, owner, or estimated deal value.
    """
    return lead_service.update_lead(db, lead_id, lead_update, current_user=current_user)

@router.patch("/{lead_id}/stage", response_model=LeadResponse, summary="Transition lead pipeline stage")
@router.put("/{lead_id}/stage", response_model=LeadResponse, summary="Transition lead pipeline stage (PUT alias)")
def update_lead_stage(
    lead_id: str,
    stage_data: LeadStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Advances lead to a new stage, updates stage duration clock, logs STAGE_CHANGE activity,
    and recalculates AI score and recommendations.
    """
    return lead_service.update_lead_stage(
        db=db,
        lead_id=lead_id,
        new_stage=stage_data.stage,
        note=stage_data.note,
        user_id=current_user.id
    )

@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete lead (Manager/Admin only)")
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["MANAGER", "ADMIN"]))
):
    """
    Deletes a lead from CRM. Only authorized for sales managers and administrators.
    """
    lead_service.delete_lead(db, lead_id)
    return None
