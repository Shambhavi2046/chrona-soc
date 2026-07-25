from fastapi import FastAPI

from app.api.routes import health, logs, alerts, dashboard, analytics, cases, graph, copilot
from app.core.config import settings
from app.utils.logger import logger

from app.core.database import engine, Base
from app.models import log_model, alert_model, case_model


# Create database tables
Base.metadata.create_all(bind=engine)


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Security Operations Platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health API
app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["Health"]
)


# Logs API
app.include_router(
    logs.router,
    prefix="/api/v1",
    tags=["Logs"]
)


# Alerts API
app.include_router(
    alerts.router,
    prefix="/api/v1",
    tags=["Alerts"]
)


# Dashboard API
app.include_router(
    dashboard.router,
    prefix="/api/v1",
    tags=["Dashboard"]
)


# Analytics API
app.include_router(
    analytics.router,
    prefix="/api/v1",
    tags=["Analytics"]
)


# Cases API
app.include_router(
    cases.router,
    prefix="/api/v1",
    tags=["Cases"]
)

# Graph API
app.include_router(
    graph.router,
    prefix="/api/v1",
    tags=["Graph"]
)

# Copilot API
app.include_router(
    copilot.router,
    prefix="/api/v1/copilot",
    tags=["Copilot"]
)


@app.on_event("startup")
def startup_event():
    logger.info(f"{settings.APP_NAME} started successfully")


@app.get("/")
def home():
    logger.info("Home endpoint accessed")

    return {
        "message": f"Welcome to {settings.APP_NAME} 🚀",
        "version": settings.APP_VERSION,
        "status": "running"
    }