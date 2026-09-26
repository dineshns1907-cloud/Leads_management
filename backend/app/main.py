import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.connection import init_db, get_db
from app.routers import (
    auth_router,
    users_router,
    leads_router,
    activities_router,
    notes_router,
    pipeline_router,
    scoring_router,
    recommendations_router,
    analytics_router,
    dashboard_router,
    search_router,
    settings_router,
    referrals_router,
    admin_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("leadiq")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing LeadIQ database tables...")
    try:
        init_db()
        logger.info("Database initialization successful.")
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
    yield
    logger.info("Shutting down LeadIQ Backend service.")

app = FastAPI(
    title="LeadIQ — AI-Powered Behaviour-Based Lead Scoring System API",
    description="REST API backend supporting behavioral telemetry, real-time lead qualification, and predictive sales closing recommendations.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"]
)

# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join([str(loc) for loc in error.get("loc", [])])
        errors.append(f"{field}: {error.get('msg')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error in request payload",
            "errors": errors,
            "status_code": 422
        }
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please contact the system administrator.",
            "status_code": 500
        }
    )

# Health Check Endpoint
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"], summary="System health and database check")
def health_check(db: Session = Depends(get_db)):
    """
    Returns API status, service identity, and verifies live database connectivity.
    """
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "service": "LeadIQ Backend",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "degraded",
                "service": "LeadIQ Backend",
                "database": "disconnected"
            }
        )

# Mount Routers under API_V1_STR (/api)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(leads_router, prefix=settings.API_V1_STR)
app.include_router(activities_router, prefix=settings.API_V1_STR)
app.include_router(notes_router, prefix=settings.API_V1_STR)
app.include_router(pipeline_router, prefix=settings.API_V1_STR)
app.include_router(scoring_router, prefix=settings.API_V1_STR)
app.include_router(recommendations_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(referrals_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/", include_in_schema=False)
def root():
    return {
        "project": "LeadIQ AI Sales Intelligence Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
