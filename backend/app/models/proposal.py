import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(64), primary_key=True, default=lambda: f"prop-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="SENT", nullable=False) # DRAFT, SENT, VIEWED, ACCEPTED, DECLINED
    sent_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    opened_at = Column(DateTime, nullable=True)
    view_count = Column(Integer, default=0, nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="proposals")
