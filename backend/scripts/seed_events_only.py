import asyncio
import sys
from app.db.session import async_session_maker
from scripts.seed import seed_events

async def main():
    async with async_session_maker() as db:
        await seed_events(db)
        
        print("Waiting 5 seconds for background detections to complete...")
        await asyncio.sleep(5)
        
        from sqlalchemy import select
        from app.models.operations import Alert
        
        result = await db.execute(select(Alert))
        alerts = result.scalars().all()
        print(f"Total alerts in database after detection engine run: {len(alerts)}")
        for a in alerts:
            print(f"- [Alert {a.id}] {a.title} (Severity: {a.severity}, Rule: {a.source_rule})")

if __name__ == "__main__":
    asyncio.run(main())
