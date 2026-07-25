from fastapi import FastAPI

from app.api.routes import health, logs, alerts, dashboard
from app.core.config import settings
from app.utils.logger import logger

from app.core.database import engine, Base
from app.models import log_model, alert_model


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Security Operations Platform",
    version=settings.APP_VERSION,
    debug=settings.DEBUG
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