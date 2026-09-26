import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.models.pipeline import PipelineStage, LeadStatus

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(64), primary_key=True, default=lambda: f"lead-{uuid.uuid4().hex[:8]}")
    public_lead_id = Column(String(32), unique=True, nullable=True, index=True)
    company_name = Column(String(255), nullable=False, index=True)
    contact_name = Column(String(255), nullable=False)
    contact_email = Column(String(255), nullable=False, index=True)
    contact_phone = Column(String(50), nullable=True)
    industry = Column(String(100), nullable=False, index=True)
    company_size = Column(String(50), nullable=True)
    location = Column(String(100), nullable=True)
    contact_role = Column(String(100), nullable=True)
    lead_source = Column(String(50), nullable=False, index=True)
    estimated_value = Column(Float, default=0.0, nullable=False)
    stage = Column(String(50), default=PipelineStage.NEW.value, nullable=False, index=True)
    status = Column(String(20), default=LeadStatus.ACTIVE.value, nullable=False, index=True)
    owner_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    referred_by_id = Column(String(64), ForeignKey("leads.id", ondelete="SET NULL"), nullable=True, index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_activity_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    stage_entered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    owner = relationship("User", back_populates="leads")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan", order_by="desc(Activity.activity_date)")
    notes = relationship("Note", back_populates="lead", cascade="all, delete-orphan", order_by="desc(Note.created_at)")
    scores = relationship("LeadScore", back_populates="lead", cascade="all, delete-orphan", order_by="desc(LeadScore.calculated_at)")
    quotations = relationship("Quotation", back_populates="lead", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="lead", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="lead", cascade="all, delete-orphan")
    pipeline_history = relationship("PipelineHistory", back_populates="lead", cascade="all, delete-orphan", order_by="desc(PipelineHistory.changed_at)")

    @property
    def latest_score(self):
        if self.scores:
            return self.scores[0]
        return None

    @property
    def days_in_current_stage(self) -> int:
        if not self.stage_entered_at:
            return 0
        delta = datetime.now(timezone.utc) - self.stage_entered_at.replace(tzinfo=timezone.utc if self.stage_entered_at.tzinfo is None else self.stage_entered_at.tzinfo)
        return max(0, delta.days)

    @property
    def total_days_in_pipeline(self) -> int:
        if not self.created_at:
            return 0
        delta = datetime.now(timezone.utc) - self.created_at.replace(tzinfo=timezone.utc if self.created_at.tzinfo is None else self.created_at.tzinfo)
        return max(0, delta.days)
