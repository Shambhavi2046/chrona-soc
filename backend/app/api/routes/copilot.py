from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import SessionLocal
from app.schemas.copilot_schema import ChatRequestSchema, ChatResponseSchema
from app.services import copilot_service
import asyncio

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/chat", response_model=ChatResponseSchema)
async def chat_with_copilot(request: ChatRequestSchema, db: Session = Depends(get_db)):
    # Simulate AI processing delay
    await asyncio.sleep(1.2)
    return copilot_service.process_chat(db, request)
