import pytest

def test_create_lead(client, sales_token):
    payload = {
        "company_name": "Nexus Dynamics Corp",
        "contact_name": "Arthur Pendelton",
        "contact_email": "arthur@nexusdynamics.io",
        "contact_phone": "+1 650-555-0921",
        "industry": "Cloud Infrastructure",
        "company_size": "250-500",
        "location": "Palo Alto, CA",
        "contact_role": "Chief Technology Officer",
        "lead_source": "Website",
        "estimated_value": 75000.0,
        "stage": "NEW",
        "status": "ACTIVE"
    }
    response = client.post("/api/leads", json=payload, headers=sales_token)
    assert response.status_code == 201
    data = response.json()
    assert data["company_name"] == "Nexus Dynamics Corp"
    assert data["contact_email"] == "arthur@nexusdynamics.io"
    assert data["stage"] == "NEW"
    assert data["status"] == "ACTIVE"
    assert "id" in data

def test_get_lead_by_id(client, sales_token, sample_lead):
    response = client.get(f"/api/leads/{sample_lead.id}", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_lead.id
    assert data["company_name"] == "Apex Global Inc"
    assert data["stage"] == "QUALIFIED"
    assert "owner_id" in data
    assert "ai_score" in data

def test_get_leads_filtering(client, sales_token, sample_lead):
    # Filter by stage
    resp_stage = client.get("/api/leads?stage=QUALIFIED", headers=sales_token)
    assert resp_stage.status_code == 200
    leads = resp_stage.json()
    assert len(leads) >= 1
    assert any(l["id"] == sample_lead.id for l in leads)

    # Filter by search
    resp_search = client.get("/api/leads?search=Apex", headers=sales_token)
    assert resp_search.status_code == 200
    leads_search = resp_search.json()
    assert len(leads_search) >= 1

    # Filter with non-matching search
    resp_none = client.get("/api/leads?search=NonExistentCorp123XYZ", headers=sales_token)
    assert resp_none.status_code == 200
    assert len(resp_none.json()) == 0

def test_update_lead(client, sales_token, sample_lead):
    update_data = {
        "company_name": "Apex Global Enterprises",
        "estimated_value": 150000.0,
        "contact_role": "Chief Information Officer"
    }
    response = client.put(f"/api/leads/{sample_lead.id}", json=update_data, headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert data["company_name"] == "Apex Global Enterprises"
    assert data["estimated_value"] == 150000.0
    assert data["contact_role"] == "Chief Information Officer"

def test_patch_lead_stage_advancement(client, sales_token, sample_lead):
    stage_update = {
        "stage": "DEMO"
    }
    response = client.patch(f"/api/leads/{sample_lead.id}/stage", json=stage_update, headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert data["stage"] == "DEMO"

    # Verify that a STAGE_CHANGE activity was recorded
    act_resp = client.get(f"/api/leads/{sample_lead.id}/activities", headers=sales_token)
    assert act_resp.status_code == 200
    activities = act_resp.json()
    stage_activities = [a for a in activities if a["activity_type"] == "STAGE_CHANGE"]
    assert len(stage_activities) >= 1
    assert "DEMO" in stage_activities[0]["description"]
