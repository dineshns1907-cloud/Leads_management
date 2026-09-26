import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(64), primary_key=True, default=lambda: f"rec-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    urgency = Column(String(20), default="today", nullable=False) # immediate, today, this_week
    category = Column(String(50), default="Follow-up", nullable=False) # Contact, Follow-up, Demo, Proposal, Nurture
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="recommendations")
