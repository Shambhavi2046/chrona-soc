from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Any
import uuid

from app.models.credentials import IntegrationCredential
from app.schemas.credentials import CredentialCreate
from app.core.crypto import encrypt_secret

class CredentialsService:
    async def create(self, db: AsyncSession, obj_in: CredentialCreate, org_id: Optional[Any] = None) -> IntegrationCredential:
        encrypted = encrypt_secret(obj_in.secret)
        db_obj = IntegrationCredential(
            name=obj_in.name,
            provider=obj_in.provider,
            encrypted_secret=encrypted
        )
        if org_id:
            db_obj.org_id = org_id
            
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_all(self, db: AsyncSession, org_id: Optional[Any] = None) -> List[IntegrationCredential]:
        query = select(IntegrationCredential)
        if org_id:
            query = query.where(IntegrationCredential.org_id == org_id)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID, org_id: Optional[Any] = None) -> Optional[IntegrationCredential]:
        query = select(IntegrationCredential).where(IntegrationCredential.id == id)
        if org_id:
            query = query.where(IntegrationCredential.org_id == org_id)
        result = await db.execute(query)
        return result.scalars().first()

    async def delete(self, db: AsyncSession, id: uuid.UUID, org_id: Optional[Any] = None) -> bool:
        obj = await self.get_by_id(db, id, org_id)
        if obj:
            await db.delete(obj)
            await db.commit()
            return True
        return False

credentials_service = CredentialsService()
