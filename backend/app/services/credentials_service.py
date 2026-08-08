from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
import uuid

from app.models.credentials import IntegrationCredential
from app.schemas.credentials import CredentialCreate
from app.core.crypto import encrypt_secret

class CredentialsService:
    async def create(self, db: AsyncSession, obj_in: CredentialCreate) -> IntegrationCredential:
        encrypted = encrypt_secret(obj_in.secret)
        db_obj = IntegrationCredential(
            name=obj_in.name,
            provider=obj_in.provider,
            encrypted_secret=encrypted
        )
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_all(self, db: AsyncSession) -> List[IntegrationCredential]:
        result = await db.execute(select(IntegrationCredential))
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Optional[IntegrationCredential]:
        result = await db.execute(select(IntegrationCredential).where(IntegrationCredential.id == id))
        return result.scalars().first()

    async def delete(self, db: AsyncSession, id: uuid.UUID) -> bool:
        obj = await self.get_by_id(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()
            return True
        return False

credentials_service = CredentialsService()
