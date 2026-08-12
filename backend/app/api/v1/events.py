from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid

from app.db.session import get_db, async_session_maker
from app.schemas.events import EventCreate, EventResponse, EventSearch
from app.services.events import event_service
from app.repositories.event_repository import event_repository
from app.utils.validation import get_pagination, PaginationParams
from app.middleware.auth import get_current_user
from app.services.detection.engine import detection_engine
import asyncio

router = APIRouter()

async def run_detections_for_event(event_id: uuid.UUID):
    """Background task to run detections for a single event."""
    async with async_session_maker() as db:
        event = await event_repository.get_by_id(db, event_id)
        if event:
            await detection_engine.evaluate_event(db, event)

async def run_detections_for_batch(event_ids: List[uuid.UUID]):
    """Background task to run detections for a batch of events."""
    async with async_session_maker() as db:
        for eid in event_ids:
            event = await event_repository.get_by_id(db, eid)
            if event:
                await detection_engine.evaluate_event(db, event)

@router.post("/ingest", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def ingest_event(
    event_in: EventCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Ingest a single security event."""
    try:
        event = await event_service.ingest_single_event(db, event_in, current_user.org_id)
        if not event:
            raise HTTPException(status_code=409, detail="Event conflict")
        background_tasks.add_task(run_detections_for_event, event.id)
        return event
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest event: {str(e)}")

@router.post("/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ingest_bulk_events(
    events_in: List[EventCreate],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Bulk ingest security events."""
    try:
        inserted = await event_service.ingest_bulk_events(db, events_in, current_user.org_id)
        
        # After bulk ingest, fetch the inserted events by event_id to pass to engine
        event_ids = [e.event_id for e in events_in]
        # We need their UUIDs for the background task
        org_id = current_user.org_id
        async def async_bulk_detect(e_ids: List[str]):
            from sqlalchemy import select
            from app.models.event_model import SecurityEvent
            import logging
            logger = logging.getLogger(__name__)
            async with async_session_maker() as session:
                for e_id in e_ids:
                    try:
                        result = await session.execute(
                            select(SecurityEvent).where(
                                SecurityEvent.event_id == e_id,
                                SecurityEvent.tenant_id == org_id
                            )
                        )
                        ev = result.scalar_one_or_none()
                        if ev:
                            await detection_engine.evaluate_event(session, ev)
                    except Exception as e:
                        logger.error(f"Failed to process event {e_id} during bulk detection: {e}", exc_info=True)
                        
        background_tasks.add_task(async_bulk_detect, event_ids)
        return {"message": f"Successfully processed {len(events_in)} events. Inserted {inserted} new events."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed bulk ingestion: {str(e)}")

@router.get("", response_model=List[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination),
    current_user: Any = Depends(get_current_user)
):
    """List most recent security events."""
    return await event_repository.search(db, skip=pagination.skip, limit=pagination.limit, org_id=current_user.org_id)

@router.get("/stats", response_model=dict)
async def get_event_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get aggregated event statistics."""
    return await event_repository.get_stats(db, org_id=current_user.org_id)

@router.get("/search", response_model=List[EventResponse])
async def search_events(
    search_params: EventSearch = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Search security events with filters."""
    return await event_repository.search(
        db=db,
        skip=search_params.skip,
        limit=search_params.limit,
        severity=search_params.severity,
        source=search_params.source,
        hostname=search_params.hostname,
        user_account=search_params.user_account,
        start_time=search_params.start_time,
        end_time=search_params.end_time,
        org_id=current_user.org_id
    )

@router.get("/{id}", response_model=EventResponse)
async def get_event(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Any = Depends(get_current_user)
):
    """Get a specific security event by ID."""
    event = await event_repository.get_by_id(db, id, org_id=current_user.org_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
