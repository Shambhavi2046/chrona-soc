import asyncio
import uuid
from app.db.session import async_session_maker
from app.models.identity import Organization, User
from app.core.security import get_password_hash
from sqlalchemy.future import select

async def seed_admin():
    async with async_session_maker() as db:
        # Check if user exists
        result = await db.execute(select(User).where(User.email == "admin@chrona.local"))
        existing_user = result.scalars().first()
        if existing_user:
            print("Admin user already exists.")
            return

        print("Seeding admin user...")
        # Get or create organization
        result = await db.execute(select(Organization).where(Organization.name == "Chrona Security"))
        org = result.scalars().first()
        if not org:
            org = Organization(
                id=uuid.uuid4(),
                name="Chrona Security",
                plan="Enterprise",
                status="Active"
            )
            db.add(org)
            await db.flush()

        admin_user = User(
            id=uuid.uuid4(),
            email="admin@chrona.local",
            name="System Administrator",
            hashed_password=get_password_hash("Admin123!@#"),
            org_id=org.id,
            status="Active"
        )
        db.add(admin_user)
        await db.commit()
        print("Admin user created successfully.")

if __name__ == "__main__":
    asyncio.run(seed_admin())
