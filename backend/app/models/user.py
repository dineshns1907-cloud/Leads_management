import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class UserRole(str, enum.Enum):
    SALESPERSON = "SALESPERSON"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"user-{uuid.uuid4().hex[:8]}")
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.SALESPERSON.value, nullable=False)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    leads = relationship("Lead", back_populates="owner")
    activities = relationship("Activity", back_populates="user")
    notes = relationship("Note", back_populates="user")
