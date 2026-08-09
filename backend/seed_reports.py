import asyncio
import uuid
import sys
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Add the backend directory to sys.path so 'app' is resolvable
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import async_session_maker
from app.models.report_model import ReportTemplate
from sqlalchemy import select

async def seed():
    async with async_session_maker() as session:
        result = await session.execute(select(ReportTemplate))
        existing = result.scalars().all()
        if existing:
            print(f"Found {len(existing)} existing templates. Skipping seed.")
            return

        templates = [
            ReportTemplate(
                id=uuid.UUID("aaaa1111-aaaa-4aaa-8aaa-aaaa11111111"),
                name="Executive Summary",
                description="High-level overview of an incident for stakeholders.",
                estimated_pages=3,
                category="Executive"
            ),
            ReportTemplate(
                id=uuid.UUID("bbbb2222-bbbb-4bbb-8bbb-bbbb22222222"),
                name="Detailed Technical Analysis",
                description="In-depth forensic and technical breakdown.",
                estimated_pages=7,
                category="Operational"
            ),
            ReportTemplate(
                id=uuid.UUID("cccc3333-cccc-4ccc-8ccc-cccc33333333"),
                name="Compliance & Regulatory",
                description="Mapping of the incident against compliance frameworks (e.g. GDPR, HIPAA).",
                estimated_pages=5,
                category="Compliance"
            )
        ]
        
        session.add_all(templates)
        await session.commit()
        print("Successfully seeded 3 report templates.")

if __name__ == "__main__":
    asyncio.run(seed())
