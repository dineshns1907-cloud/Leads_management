import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class ActivityType(str, enum.Enum):
    CALL = "CALL"
    EMAIL = "EMAIL"
    EMAIL_RESPONSE = "EMAIL_RESPONSE"
    MEETING = "MEETING"
    FOLLOW_UP = "FOLLOW_UP"
    DEMO = "DEMO"
    QUOTATION = "QUOTATION"
    PROPOSAL = "PROPOSAL"
    WEBSITE_VISIT = "WEBSITE_VISIT"
    PRICING_PAGE_VISIT = "PRICING_PAGE_VISIT"
    STAGE_CHANGE = "STAGE_CHANGE"

class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(64), primary_key=True, default=lambda: f"act-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    activity_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    activity_metadata = Column(JSON, nullable=True)  # stores details like duration, outcome, score_impact
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="activities")
    user = relationship("User", back_populates="activities")
