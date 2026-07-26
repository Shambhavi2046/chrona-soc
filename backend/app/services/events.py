import logging
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.events import EventCreate
from app.repositories.event_repository import event_repository

logger = logging.getLogger(__name__)

class EventNormalizationService:
    
    async def ingest_single_event(self, db: AsyncSession, event_in: EventCreate) -> Any:
        try:
            # Here future adapters could transform raw_event based on 'source'
            # For now, it passes the EventCreate object directly as it is strongly typed
            result = await event_repository.ingest_single(db, event_in)
            logger.info(f"Successfully ingested event: {event_in.event_id} from {event_in.source}")
            return result
        except Exception as e:
            logger.error(f"Failed to ingest single event {event_in.event_id}: {str(e)}", exc_info=True)
            raise e
            
    async def ingest_bulk_events(self, db: AsyncSession, events_in: List[EventCreate]) -> int:
        try:
            inserted_count = await event_repository.ingest_bulk(db, events_in)
            logger.info(f"Successfully ingested bulk batch of {inserted_count} events.")
            return inserted_count
        except Exception as e:
            logger.error(f"Failed bulk ingestion of {len(events_in)} events: {str(e)}", exc_info=True)
            raise e

event_service = EventNormalizationService()
