from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.lead import LeadResponse
from app.schemas.activity import ActivityResponse
from app.schemas.recommendation import RecommendationResponse

class AnalyticsOverview(BaseModel):
    total_leads: int
    active_opportunities: int
    won_leads: int
    lost_leads: int
    conversion_rate: float
    average_score: float
    average_pipeline_time: int
    average_stage_time: int
    pipeline_value: float
    total_leads_trend: str = "+14% vs last month"
    conversion_rate_trend: str = "+3.2% vs Q2"
    avg_score_trend: str = "+4 pts overall"

class SourceMetric(BaseModel):
    source: str
    count: int
    percentage: float
    color: str

class StageMetric(BaseModel):
    stage: str
    count: int
    value: float
    formatted_value: str
    conversion_rate: str

class EngagementMetric(BaseModel):
    week: str
    calls: int
    emails: int
    demos: int

class ConversionMetric(BaseModel):
    month: str
    rate: float
    benchmark: float

class BehavioralInsight(BaseModel):
    insight_type: str
    title: str
    description: str
    affected_leads: int
    severity: str  # high, medium, low

class ConversionProbabilitySummary(BaseModel):
    hot: int = 0
    warm: int = 0
    nurture: int = 0
    cold: int = 0
    hot_percentage: int = 0
    warm_percentage: int = 0
    nurture_percentage: int = 0
    cold_percentage: int = 0

class PipelineOverviewResponse(BaseModel):
    stages: List[StageMetric]
    total_active_leads: int
    total_pipeline_value: float
    average_score: float

class DashboardResponse(BaseModel):
    total_leads: int
    active_opportunities: int
    hot_leads_count: int
    average_score: float
    follow_ups_due: int
    conversion_rate: float
    pipeline_value: float
    priority_leads: List[LeadResponse]
    ai_insights: List[BehavioralInsight]
    pipeline_stages: List[StageMetric]
    recent_activities: List[ActivityResponse]
    recommendations: List[RecommendationResponse]
    conversion_probability_summary: Optional[ConversionProbabilitySummary] = None
    probability_distribution: Optional[ConversionProbabilitySummary] = None
    high_value_priority_leads: Optional[List[LeadResponse]] = []
    referral_activity: Optional[Dict[str, Any]] = None

