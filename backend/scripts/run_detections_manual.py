import asyncio
from sqlalchemy import select
from app.db.session import async_session_maker
from app.models.event_model import SecurityEvent
from app.models.operations import Alert
from app.services.detection.engine import detection_engine
import app.db.base

async def run_detections_on_existing_events():
    async with async_session_maker() as db:
        # Clear existing alerts to start fresh
        await db.execute(Alert.__table__.delete())
        await db.commit()
        
        # Fetch all events
        result = await db.execute(select(SecurityEvent))
        events = result.scalars().all()
        
        print(f"Found {len(events)} events. Running detection engine...")
        
        for event in events:
            await detection_engine.evaluate_event(db, event)
            
        # Verify Alerts
        alert_result = await db.execute(select(Alert))
        alerts = alert_result.scalars().all()
        print(f"\nTotal alerts generated: {len(alerts)}")
        for a in alerts:
            print(f"- [Alert {a.id}] {a.title} (Severity: {a.severity}, Rule: {a.source_rule})")
            if a.related_events:
                print(f"  -> Correlated {len(a.related_events)} events")

if __name__ == "__main__":
    asyncio.run(run_detections_on_existing_events())
