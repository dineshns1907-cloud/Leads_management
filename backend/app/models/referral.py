import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.base import Base

class ReferralStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONVERTED = "CONVERTED"
    REJECTED = "REJECTED"
    REWARD_ELIGIBLE = "REWARD_ELIGIBLE"
    REWARD_GRANTED = "REWARD_GRANTED"

class RewardType(str, enum.Enum):
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT"
    FIXED_DISCOUNT = "FIXED_DISCOUNT"
    CREDIT = "CREDIT"
    AWARD = "AWARD"

class RewardStatus(str, enum.Enum):
    PENDING = "PENDING"
    ELIGIBLE = "ELIGIBLE"
    GRANTED = "GRANTED"
    VOID = "VOID"

class Referral(Base):
    __tablename__ = "referrals"

    id = Column(String(64), primary_key=True, default=lambda: f"ref-{uuid.uuid4().hex[:8]}")
    referrer_customer_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    referred_lead_id = Column(String(64), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True)
    referral_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    status = Column(String(30), default=ReferralStatus.PENDING.value, nullable=False, index=True)
    reward_type = Column(String(50), default=RewardType.PERCENTAGE_DISCOUNT.value, nullable=False)
    reward_value = Column(Float, default=10.0, nullable=False)
    reward_status = Column(String(30), default=RewardStatus.PENDING.value, nullable=False, index=True)
    deal_value = Column(Float, default=0.0, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    referrer_customer = relationship("Lead", foreign_keys=[referrer_customer_id], backref="referrals_made")
    referred_lead = relationship("Lead", foreign_keys=[referred_lead_id], backref="referral_received")
