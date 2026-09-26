import pytest

def test_create_lead_activity(client, sales_token, sample_lead):
    payload = {
        "activity_type": "CALL",
        "description": "Executive alignment call with VP Technology regarding Q4 rollout",
        "activity_metadata": {"duration_minutes": 30, "outcome": "positive"}
    }
    response = client.post(f"/api/leads/{sample_lead.id}/activities", json=payload, headers=sales_token)
    assert response.status_code == 201
    data = response.json()
    assert data["activity_type"] == "CALL"
    assert data["lead_id"] == sample_lead.id
    assert "Executive alignment" in data["description"]

def test_activity_triggers_score_recalculation(client, sales_token, sample_lead):
    # Log high-intent activity
    payload = {
        "activity_type": "DEMO",
        "description": "Completed customized multi-user product demonstration with positive feedback",
        "activity_metadata": {"attendees": 4}
    }
    act_resp = client.post(f"/api/leads/{sample_lead.id}/activities", json=payload, headers=sales_token)
    assert act_resp.status_code == 201

    # Check score reflects the new activity
    score_resp = client.get(f"/api/leads/{sample_lead.id}/score", headers=sales_token)
    assert score_resp.status_code == 200
    score_data = score_resp.json()
    factors = [f["factor"].lower() for f in score_data["positive_factors"]]
    assert any("demo" in f for f in factors)

def test_get_activities_filter(client, sales_token, sample_lead):
    # Create another activity
    client.post(
        f"/api/leads/{sample_lead.id}/activities",
        json={"activity_type": "EMAIL", "description": "Sent follow up spec sheet"},
        headers=sales_token
    )

    # Filter global activities by activity_type
    response = client.get("/api/activities?activity_type=EMAIL", headers=sales_token)
    assert response.status_code == 200
    activities = response.json()
    assert all(a["activity_type"] == "EMAIL" for a in activities)
