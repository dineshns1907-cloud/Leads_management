import pytest

def test_get_lead_score_breakdown(client, sales_token, sample_lead):
    # Recalculate score explicitly
    recalc_resp = client.post(f"/api/leads/{sample_lead.id}/score/recalculate", headers=sales_token)
    assert recalc_resp.status_code == 200
    recalc_data = recalc_resp.json()
    assert "new_score" in recalc_data
    assert "lead_id" in recalc_data

    # Fetch full score detail breakdown
    get_resp = client.get(f"/api/leads/{sample_lead.id}/score", headers=sales_token)
    assert get_resp.status_code == 200
    data = get_resp.json()

    assert "score" in data
    assert "conversion_probability" in data
    assert 0.0 <= data["conversion_probability"] <= 1.0
    assert data["classification"] in ["HOT", "WARM", "NURTURE", "COLD"]
    assert data["engagement_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert "positive_factors" in data
    assert "negative_factors" in data

    # Positive factors should have factor name and impact
    for pf in data["positive_factors"]:
        assert "factor" in pf
        assert "impact" in pf
        assert pf["impact"] >= 0

    # Negative factors should have negative impact
    for nf in data["negative_factors"]:
        assert "factor" in nf
        assert "impact" in nf
        assert nf["impact"] <= 0

def test_get_lead_score_persisted(client, sales_token, sample_lead):
    response = client.get(f"/api/leads/{sample_lead.id}/score", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "calculated_at" in data
