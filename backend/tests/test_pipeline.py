import pytest

def test_get_pipeline_kanban(client, sales_token, sample_lead):
    response = client.get("/api/pipeline", headers=sales_token)
    assert response.status_code == 200
    data = response.json()

    assert "stages" in data
    assert "lead_count" in data
    assert "pipeline_value" in data
    assert "average_score" in data

    # Verify standard active pipeline stages are returned
    stages = data["stages"]
    assert "NEW" in stages
    assert "CONTACTED" in stages
    assert "QUALIFIED" in stages
    assert "DEMO" in stages
    assert "PROPOSAL" in stages
    assert "NEGOTIATION" in stages

    # Check stage grouping: stages["QUALIFIED"] is a list of leads in that stage
    qualified_leads = stages["QUALIFIED"]
    assert isinstance(qualified_leads, list)
    assert len(qualified_leads) >= 1
    assert any(l["id"] == sample_lead.id for l in qualified_leads)

    # WON and LOST should not be present in active pipeline stages
    assert "WON" not in stages
    assert "LOST" not in stages
