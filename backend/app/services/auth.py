from datetime import datetime
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from sqlalchemy import select
from app.repositories.user import user_repo
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.schemas.token import Token
from app.models.identity import UserSession
from jose import jwt
from app.core.config import settings

class AuthService:
    async def authenticate(self, db: AsyncSession, email: str, password: str):
        user = await user_repo.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def create_session(self, db: AsyncSession, user_id: uuid.UUID | str, device_info: str = None, ip_address: str = None) -> Token:
        token_subject = str(user_id)
        access_token = create_access_token(subject=token_subject)
        refresh_token = create_refresh_token(subject=token_subject)
        
        # calculate expiry for db entry
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        exp = datetime.fromtimestamp(payload.get("exp"))
        
        db_session = UserSession(
            user_id=user_id,
            refresh_token=refresh_token,
            expires_at=exp,
            device_info=device_info,
            ip_address=ip_address
        )
        db.add(db_session)
        await db.commit()
        
        return Token(access_token=access_token, refresh_token=refresh_token)

    async def logout(self, db: AsyncSession, refresh_token: str):
        result = await db.execute(select(UserSession).filter(UserSession.refresh_token == refresh_token))
        session = result.scalars().first()
        if session:
            session.is_revoked = True
            db.add(session)
            await db.commit()

auth_service = AuthService()
