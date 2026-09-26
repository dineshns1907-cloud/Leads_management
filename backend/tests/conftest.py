import os
import sys
import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.base import Base
from app.database.connection import get_db
from app.main import app
from app.models.user import User, UserRole
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.core.security import get_password_hash, create_access_token

# In-memory SQLite engine for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture()
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture()
def test_users(db_session):
    """Seed test users across all roles: SALESPERSON, MANAGER, ADMIN"""
    users = {
        "salesperson": User(
            id="test-sales-1",
            name="Alex Rep",
            email="sales@test.com",
            password_hash=get_password_hash("Sales123!"),
            role=UserRole.SALESPERSON.value,
            phone="+1 555-0101",
            is_active=True
        ),
        "manager": User(
            id="test-mgr-1",
            name="Elena Manager",
            email="manager@test.com",
            password_hash=get_password_hash("Manager123!"),
            role=UserRole.MANAGER.value,
            phone="+1 555-0102",
            is_active=True
        ),
        "admin": User(
            id="test-admin-1",
            name="Super Admin",
            email="admin@test.com",
            password_hash=get_password_hash("Admin123!"),
            role=UserRole.ADMIN.value,
            phone="+1 555-0103",
            is_active=True
        ),
    }
    for u in users.values():
        db_session.add(u)
    db_session.commit()
    for u in users.values():
        db_session.refresh(u)
    return users

@pytest.fixture()
def sales_token(test_users):
    user = test_users["salesperson"]
    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture()
def manager_token(test_users):
    user = test_users["manager"]
    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture()
def admin_token(test_users):
    user = test_users["admin"]
    token = create_access_token(data={"sub": user.email, "role": user.role, "id": user.id})
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture()
def sample_lead(db_session, test_users):
    sales_rep = test_users["salesperson"]
    now = datetime.now(timezone.utc)
    lead = Lead(
        id="lead-test-101",
        company_name="Apex Global Inc",
        contact_name="Sarah Connor",
        contact_email="sarah@apexglobal.io",
        contact_phone="+1 415-555-8822",
        industry="Enterprise Software",
        company_size="500-1,000",
        location="San Francisco, CA",
        contact_role="VP of Technology",
        lead_source="Website",
        estimated_value=120000.0,
        stage=PipelineStage.QUALIFIED.value,
        status=LeadStatus.ACTIVE.value,
        owner_id=sales_rep.id,
        created_at=now,
        updated_at=now,
        stage_entered_at=now,
        last_activity_at=now
    )
    db_session.add(lead)
    db_session.commit()
    db_session.refresh(lead)
    return lead
