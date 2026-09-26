import pytest

def test_analytics_overview(client, sales_token, sample_lead):
    response = client.get("/api/analytics/overview", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert "total_leads" in data
    assert "active_opportunities" in data
    assert "won_leads" in data
    assert "lost_leads" in data
    assert "conversion_rate" in data
    assert "average_score" in data
    assert "pipeline_value" in data

def test_analytics_sources(client, sales_token, sample_lead):
    response = client.get("/api/analytics/sources", headers=sales_token)
    assert response.status_code == 200
    sources = response.json()
    assert isinstance(sources, list)
    if len(sources) > 0:
        assert "source" in sources[0]
        assert "count" in sources[0]

def test_analytics_stages(client, sales_token, sample_lead):
    response = client.get("/api/analytics/stages", headers=sales_token)
    assert response.status_code == 200
    stages = response.json()
    assert isinstance(stages, list)
    if len(stages) > 0:
        assert "stage" in stages[0]
        assert "count" in stages[0]

def test_analytics_engagement(client, sales_token, sample_lead):
    response = client.get("/api/analytics/engagement", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "week" in data[0]
        assert "calls" in data[0]
        assert "emails" in data[0]
        assert "demos" in data[0]

def test_analytics_conversion(client, sales_token, sample_lead):
    response = client.get("/api/analytics/conversion", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "month" in data[0]
        assert "rate" in data[0]
        assert "benchmark" in data[0]

def test_dashboard_endpoint(client, sales_token, sample_lead):
    response = client.get("/api/dashboard", headers=sales_token)
    assert response.status_code == 200
    data = response.json()
    assert "total_leads" in data
    assert "hot_leads_count" in data
    assert "average_score" in data
    assert "follow_ups_due" in data
    assert "priority_leads" in data
    assert "ai_insights" in data
    assert "pipeline_stages" in data
    assert "recent_activities" in data
    assert "recommendations" in data
