from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

from app.database.connection import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.lead import LeadResponse
from app.core.security import get_current_user
from app.services.lead_service import lead_service

router = APIRouter(prefix="/search", tags=["Global Search"])

class SearchResultItem(BaseModel):
    id: str
    public_lead_id: Optional[str] = None
    title: str
    subtitle: str
    category: str  # Lead, Contact, Company
    score: Optional[int] = None
    stage: Optional[str] = None
    salesperson: Optional[str] = None
    url: str

class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]
    leads: List[LeadResponse]

@router.get("", response_model=SearchResponse, summary="Global cross-entity search")
def global_search(
    q: str = Query(..., min_length=1, description="Search query string"),
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Searches across public Lead ID, company name, contact name, contact email, industry, location, and role.
    Returns structured matches for quick dropdown display and full lead records.
    """
    pattern = f"%{q.strip()}%"
    leads = db.query(Lead).filter(
        or_(
            Lead.public_lead_id.ilike(pattern),
            Lead.company_name.ilike(pattern),
            Lead.contact_name.ilike(pattern),
            Lead.contact_email.ilike(pattern),
            Lead.industry.ilike(pattern),
            Lead.location.ilike(pattern),
            Lead.contact_role.ilike(pattern)
        )
    ).limit(limit).all()

    items: List[SearchResultItem] = []
    for l in leads:
        score_val = l.latest_score.score if l.latest_score else 50
        owner_name = l.owner.name if l.owner else "Alex Rivera"
        lead_id_str = f"Lead ID: {l.public_lead_id}" if l.public_lead_id else ""
        subtitle = f"{lead_id_str} · Salesperson: {owner_name} · Stage: {l.stage}" if lead_id_str else f"{l.contact_name} ({l.contact_role or 'Contact'}) · {l.industry}"
        
        items.append(SearchResultItem(
            id=l.id,
            public_lead_id=l.public_lead_id,
            title=l.company_name,
            subtitle=subtitle,
            category="Lead",
            score=score_val,
            stage=l.stage,
            salesperson=owner_name,
            url=f"/leads/{l.id}"
        ))

    return SearchResponse(
        query=q,
        total_results=len(items),
        results=items,
        leads=[lead_service._build_lead_response(l) for l in leads]
    )
