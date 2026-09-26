import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base

class PipelineHistory(Base):
    __tablename__ = "pipeline_history"

    id = Column(String(64), primary_key=True, default=lambda: f"hist-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_stage = Column(String(50), nullable=True)
    new_stage = Column(String(50), nullable=False)
    changed_by = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    lead = relationship("Lead", back_populates="pipeline_history")
    changer = relationship("User")
