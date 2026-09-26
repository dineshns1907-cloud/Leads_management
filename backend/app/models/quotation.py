import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String(64), primary_key=True, default=lambda: f"quot-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    quotation_number = Column(String(50), nullable=False, unique=True)
    amount = Column(Float, nullable=False)
    status = Column(String(20), default="REQUESTED", nullable=False) # REQUESTED, SENT, ACCEPTED, REJECTED
    requested_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_until = Column(DateTime, nullable=True)

    # Relationships
    lead = relationship("Lead", back_populates="quotations")
