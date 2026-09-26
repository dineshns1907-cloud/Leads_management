import pytest

def test_get_recommendations(client, sales_token, sample_lead):
    response = client.get("/api/recommendations", headers=sales_token)
    assert response.status_code == 200
    recommendations = response.json()
    assert isinstance(recommendations, list)

    if len(recommendations) > 0:
        rec = recommendations[0]
        assert "action" in rec or "recommended_action" in rec
        assert "reason" in rec
        assert "urgency" in rec

def test_get_focus_mode(client, sales_token, sample_lead):
    # Log a high intent activity to drive lead score high
    client.post(
        f"/api/leads/{sample_lead.id}/activities",
        json={"activity_type": "DEMO", "description": "Completed customized multi-user product demonstration"},
        headers=sales_token
    )
    client.post(
        f"/api/leads/{sample_lead.id}/activities",
        json={"activity_type": "QUOTATION", "description": "Quotation submitted"},
        headers=sales_token
    )

    response = client.get("/api/recommendations/focus", headers=sales_token)
    assert response.status_code == 200
    focus_leads = response.json()
    assert isinstance(focus_leads, list)

    for item in focus_leads:
        assert "lead_id" in item
        assert "score" in item
        assert "conversion_probability" in item or "probability" in item
        assert "recommended_action" in item or "action" in item
        assert "urgency" in item
