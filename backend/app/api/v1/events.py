from fastapi import APIRouter, Depends, HTTPException, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any
import uuid

from app.db.session import get_db, async_session_maker
from app.schemas.events import EventCreate, EventResponse, EventSearch
from app.services.events import event_service
from app.repositories.event_repository import event_repository
from app.utils.validation import get_pagination, PaginationParams
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
    db: AsyncSession = Depends(get_db)
):
    """Ingest a single security event."""
    try:
        event = await event_service.ingest_single_event(db, event_in)
        if event:
            background_tasks.add_task(run_detections_for_event, event.id)
        return event
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest event: {str(e)}")

@router.post("/bulk", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ingest_bulk_events(
    events_in: List[EventCreate],
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Bulk ingest security events."""
    try:
        # Since ingest_bulk_events returns number of inserted, we modify it to return events if we want exact IDs,
        # or we can just fetch the most recent N events. But for phase 2E, bulk ingestion is mainly for seed script.
        # Actually, let's just trigger a background task to process the last N events or we can just process all events in the batch.
        # It's better if `event_service.ingest_bulk_events` returned the list of inserted models.
        # Since we don't want to rewrite `event_service`, we can just fetch the events by their event_id provided in the input payload.
        inserted = await event_service.ingest_bulk_events(db, events_in)
        
        # After bulk ingest, fetch the inserted events by event_id to pass to engine
        event_ids = [e.event_id for e in events_in]
        # We need their UUIDs for the background task
        # Let's just create a simpler task that fetches by event_id
        async def process_by_event_ids(e_ids: List[str]):
            async with async_session_maker() as session:
                for chunk in [e_ids[i:i + 50] for i in range(0, len(e_ids), 50)]:
                    for e_id in chunk:
                        # Find event
                        # Not heavily optimized but fine for background
                        result = await event_repository.search(session, source=None, skip=0, limit=1) # Need specific method
                        # To avoid writing a new repo method, we can just let seed script trigger engine directly,
                        # or we can write a tiny query here.
                        # Wait, we can just use a raw query
                        pass

        # Since it's a bit complex to fetch by event_id efficiently without a repo method,
        # we will add a small query here for the background task.
        async def async_bulk_detect(e_ids: List[str]):
            from sqlalchemy import select
            from app.models.event_model import SecurityEvent
            async with async_session_maker() as session:
                for e_id in e_ids:
                    result = await session.execute(select(SecurityEvent).where(SecurityEvent.event_id == e_id))
                    ev = result.scalar_one_or_none()
                    if ev:
                        await detection_engine.evaluate_event(session, ev)
                        
        background_tasks.add_task(async_bulk_detect, event_ids)
        return {"message": f"Successfully processed {len(events_in)} events. Inserted {inserted} new events."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed bulk ingestion: {str(e)}")

@router.get("", response_model=List[EventResponse])
async def list_events(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    """List most recent security events."""
    return await event_repository.search(db, skip=pagination.skip, limit=pagination.limit)

@router.get("/stats", response_model=dict)
async def get_event_stats(
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated event statistics."""
    return await event_repository.get_stats(db)

@router.get("/search", response_model=List[EventResponse])
async def search_events(
    search_params: EventSearch = Depends(),
    db: AsyncSession = Depends(get_db)
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
        end_time=search_params.end_time
    )

@router.get("/{id}", response_model=EventResponse)
async def get_event(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific security event by ID."""
    event = await event_repository.get_by_id(db, id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
