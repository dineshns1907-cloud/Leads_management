from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
from app.database.connection import get_db
from app.models.user import User, UserRole
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.core.security import require_roles, get_password_hash, get_current_user
from app.services.business_priority_service import format_inr

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

class SalespersonCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    phone: Optional[str] = None
    role: str = Field(default="SALESPERSON")
    department: Optional[str] = Field(default="Enterprise Sales")
    is_active: bool = True

class SalespersonUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class StatusUpdate(BaseModel):
    is_active: bool

class SalespersonResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    is_active: bool
    assigned_leads_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class AdminDashboardMetrics(BaseModel):
    total_salespeople: int
    active_salespeople: int
    total_leads: int
    active_opportunities: int
    won_deals: int
    total_pipeline_value: float
    total_pipeline_value_formatted: str
    sales_team: List[SalespersonResponse]

@router.get("/dashboard", response_model=AdminDashboardMetrics, summary="Admin Executive Overview Dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """
    Returns enterprise CRM performance metrics and complete sales team roster.
    Restricted to ADMIN role.
    """
    # Sales team
    users = db.query(User).all()
    total_sp = sum(1 for u in users if u.role in [UserRole.SALESPERSON.value, "SALES_REPRESENTATIVE", "SALESPERSON"])
    active_sp = sum(1 for u in users if u.role in [UserRole.SALESPERSON.value, "SALES_REPRESENTATIVE", "SALESPERSON"] and u.is_active)

    # Lead metrics
    leads = db.query(Lead).all()
    total_leads = len(leads)
    active_opps = sum(1 for l in leads if l.stage not in [PipelineStage.WON.value, PipelineStage.LOST.value])
    won_deals = sum(1 for l in leads if l.stage == PipelineStage.WON.value)
    pipeline_val = sum(float(l.estimated_value or 0.0) for l in leads if l.stage not in [PipelineStage.WON.value, PipelineStage.LOST.value])

    team_roster: List[SalespersonResponse] = []
    for u in users:
        leads_count = sum(1 for l in leads if l.owner_id == u.id)
        team_roster.append(SalespersonResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            phone=u.phone,
            role=u.role,
            department=u.department or "Sales",
            is_active=u.is_active,
            assigned_leads_count=leads_count,
            created_at=u.created_at
        ))

    return AdminDashboardMetrics(
        total_salespeople=total_sp if total_sp > 0 else len(users),
        active_salespeople=active_sp if active_sp > 0 else len(users),
        total_leads=total_leads,
        active_opportunities=active_opps,
        won_deals=won_deals,
        total_pipeline_value=pipeline_val,
        total_pipeline_value_formatted=format_inr(pipeline_val),
        sales_team=team_roster
    )

@router.get("/users", response_model=List[SalespersonResponse], summary="List all sales team accounts")
def list_sales_team(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    users = db.query(User).all()
    res = []
    for u in users:
        leads_count = db.query(Lead).filter(Lead.owner_id == u.id).count()
        res.append(SalespersonResponse(
            id=u.id,
            name=u.name,
            email=u.email,
            phone=u.phone,
            role=u.role,
            department=u.department or "Sales",
            is_active=u.is_active,
            assigned_leads_count=leads_count,
            created_at=u.created_at
        ))
    return res

@router.post("/users", response_model=SalespersonResponse, status_code=status.HTTP_201_CREATED, summary="Create a new salesperson account")
def create_salesperson_account(
    account_in: SalespersonCreate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    """
    Creates a new salesperson or manager user account with secure password hashing.
    Admin access only.
    """
    email_clean = account_in.email.strip().lower()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email {email_clean} already exists."
        )

    now = datetime.now(timezone.utc)
    role_val = account_in.role.upper()
    if role_val in ["SALES_REPRESENTATIVE", "SALES REP"]:
        role_val = UserRole.SALESPERSON.value

    user = User(
        name=account_in.name.strip(),
        email=email_clean,
        password_hash=get_password_hash(account_in.password),
        role=role_val,
        phone=account_in.phone,
        department=account_in.department or "Sales",
        is_active=account_in.is_active,
        created_at=now,
        updated_at=now
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return SalespersonResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        department=user.department,
        is_active=user.is_active,
        assigned_leads_count=0,
        created_at=user.created_at
    )

@router.put("/users/{user_id}", response_model=SalespersonResponse, summary="Update salesperson account details")
def update_salesperson_account(
    user_id: str,
    update_data: SalespersonUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    if update_data.name is not None:
        user.name = update_data.name
    if update_data.email is not None:
        user.email = update_data.email.strip().lower()
    if update_data.phone is not None:
        user.phone = update_data.phone
    if update_data.department is not None:
        user.department = update_data.department
    if update_data.role is not None:
        user.role = update_data.role.upper()
    if update_data.is_active is not None:
        user.is_active = update_data.is_active

    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    leads_count = db.query(Lead).filter(Lead.owner_id == user.id).count()
    return SalespersonResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        department=user.department,
        is_active=user.is_active,
        assigned_leads_count=leads_count,
        created_at=user.created_at
    )

@router.patch("/users/{user_id}/status", response_model=SalespersonResponse, summary="Activate or deactivate salesperson account")
def toggle_salesperson_status(
    user_id: str,
    status_in: StatusUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found")

    user.is_active = status_in.is_active
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    leads_count = db.query(Lead).filter(Lead.owner_id == user.id).count()
    return SalespersonResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        department=user.department,
        is_active=user.is_active,
        assigned_leads_count=leads_count,
        created_at=user.created_at
    )
