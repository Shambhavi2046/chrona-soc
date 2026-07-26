from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

@router.get("/version")
async def version():
    return {"version": settings.VERSION}

@router.get("/ready")
async def ready_check(db: AsyncSession = Depends(get_db)):
    try:
        # Simple query to check db connection
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        return {"status": "not_ready", "database": "disconnected", "error": str(e)}
