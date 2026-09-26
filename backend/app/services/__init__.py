from app.services.auth_service import auth_service, AuthService
from app.services.scoring_service import scoring_service, ScoringService
from app.services.activity_service import activity_service, ActivityService
from app.services.recommendation_service import recommendation_service, RecommendationService
from app.services.lead_service import lead_service, LeadService
from app.services.analytics_service import analytics_service, AnalyticsService

__all__ = [
    "auth_service", "AuthService",
    "scoring_service", "ScoringService",
    "activity_service", "ActivityService",
    "recommendation_service", "RecommendationService",
    "lead_service", "LeadService",
    "analytics_service", "AnalyticsService"
]
