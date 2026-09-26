import pytest

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "LeadIQ Backend" in data["service"]

def test_register_user(client):
    payload = {
        "name": "Jane Developer",
        "email": "jane@example.com",
        "password": "SecurePassword123!",
        "role": "SALESPERSON",
        "phone": "+1 555-9090"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "jane@example.com"
    assert data["role"] == "SALESPERSON"
    assert "password" not in data
    assert "password_hash" not in data

def test_register_duplicate_email(client, test_users):
    payload = {
        "name": "Alex Duplicate",
        "email": "sales@test.com", # already exists in fixture
        "password": "Password123!",
        "role": "SALESPERSON"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]

def test_login_success(client, test_users):
    # REST API JSON login
    login_data = {
        "email": "sales@test.com",
        "password": "Sales123!"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "sales@test.com"
    assert "password_hash" not in data["user"]

def test_login_invalid_password(client, test_users):
    login_data = {
        "email": "sales@test.com",
        "password": "WrongPassword!"
    }
    response = client.post("/api/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_token_login_oauth2_form(client, test_users):
    # OAuth2 form-data standard
    form_data = {
        "username": "sales@test.com",
        "password": "Sales123!"
    }
    response = client.post("/api/auth/token", data=form_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "sales@test.com"

def test_get_current_user_me(client, sales_token):
    response = client.get("/api/auth/me", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "sales@test.com"
    assert data["role"] == "SALESPERSON"

def test_get_current_user_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401

def test_logout(client, sales_token):
    response = client.post("/api/auth/logout", headers=sales_token)
    assert response.status_code == 200
    assert "logged out" in response.json()["message"].lower()
