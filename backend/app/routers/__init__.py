from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.leads import router as leads_router
from app.routers.activities import router as activities_router
from app.routers.notes import router as notes_router
from app.routers.pipeline import router as pipeline_router
from app.routers.scoring import router as scoring_router
from app.routers.recommendations import router as recommendations_router
from app.routers.analytics import router as analytics_router
from app.routers.dashboard import router as dashboard_router
from app.routers.search import router as search_router
from app.routers.settings import router as settings_router
from app.routers.referrals import router as referrals_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router",
    "leads_router",
    "activities_router",
    "notes_router",
    "pipeline_router",
    "scoring_router",
    "recommendations_router",
    "analytics_router",
    "dashboard_router",
    "search_router",
    "settings_router",
    "referrals_router",
    "admin_router"
]
