import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

class LeadScore(Base):
    __tablename__ = "lead_scores"

    id = Column(String(64), primary_key=True, default=lambda: f"score-{uuid.uuid4().hex[:8]}")
    lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False, index=True)
    conversion_probability = Column(Float, nullable=False)  # 0.0 to 1.0 (e.g. 0.87 for 87%)
    classification = Column(String(20), nullable=False, index=True)  # HOT, WARM, NURTURE, COLD
    engagement_level = Column(String(20), nullable=False)  # HIGH, MEDIUM, LOW
    positive_score = Column(Integer, default=0, nullable=False)
    negative_score = Column(Integer, default=0, nullable=False)
    score_factors = Column(JSON, nullable=True)  # {"positive_factors": [...], "negative_factors": [...]}
    business_priority_score = Column(Integer, default=50, nullable=False)  # 0 to 100
    business_priority_tier = Column(String(20), default="MEDIUM", nullable=False)  # VERY HIGH, HIGH, MEDIUM, LOW
    business_priority_factors = Column(JSON, nullable=True)  # List of explanation reasons
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lead = relationship("Lead", back_populates="scores")
