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

    async def create_session(self, db: AsyncSession, user_id: uuid.UUID | str, session_version: int = 1, device_info: str = None, ip_address: str = None) -> Token:
        token_subject = str(user_id)
        access_token = create_access_token(subject=token_subject, session_version=session_version)
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

    async def refresh_session(self, db: AsyncSession, refresh_token: str) -> Token:
        from jose import JWTError
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        except JWTError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        if not payload.get("refresh"):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is not a refresh token")

        result = await db.execute(select(UserSession).filter(UserSession.refresh_token == refresh_token))
        session = result.scalars().first()

        if not session or session.is_revoked:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session invalid or revoked")
        
        if session.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired")

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token payload")
        
        try:
            import uuid
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format")

        user = await user_repo.get(db, user_uuid)
        if not user or user.status != "Active":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")

        new_access_token = create_access_token(subject=user_id, session_version=user.session_version)
        return Token(access_token=new_access_token, refresh_token=refresh_token)

    async def forgot_password(self, db: AsyncSession, email: str):
        user = await user_repo.get_by_email(db, email)
        if not user or user.status != "Active":
            return
            
        import secrets
        import hashlib
        from datetime import datetime, timedelta
        
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        from app.models.identity import PasswordResetToken
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.utcnow() + timedelta(hours=1)
        )
        db.add(reset_token)
        await db.commit()
        
        print(f"FORGOT PASSWORD TOKEN GENERATED FOR {email}: {token}")

    async def reset_password(self, db: AsyncSession, token: str, new_password: str):
        import hashlib
        from datetime import datetime
        from app.models.identity import PasswordResetToken
        from sqlalchemy import select
        from app.core.security import get_password_hash
        
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        result = await db.execute(
            select(PasswordResetToken)
            .filter(PasswordResetToken.token_hash == token_hash)
        )
        reset_record = result.scalars().first()
        
        if not reset_record or reset_record.is_used or reset_record.expires_at < datetime.utcnow():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
            
        user = await user_repo.get(db, reset_record.user_id)
        if not user or user.status != "Active":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
            
        user.hashed_password = get_password_hash(new_password)
        user.session_version += 1
        reset_record.is_used = True
        
        from app.models.identity import UserSession
        sessions = await db.execute(select(UserSession).filter(UserSession.user_id == user.id))
        for session in sessions.scalars().all():
            session.is_revoked = True
            
        db.add(user)
        db.add(reset_record)
        await db.commit()

    async def get_active_sessions(self, db: AsyncSession, user_id: uuid.UUID):
        from datetime import datetime
        from sqlalchemy import select
        from app.models.identity import UserSession
        
        result = await db.execute(
            select(UserSession)
            .filter(UserSession.user_id == user_id, UserSession.is_revoked == False, UserSession.expires_at > datetime.utcnow())
        )
        return result.scalars().all()

    async def revoke_session(self, db: AsyncSession, session_id: uuid.UUID, user_id: uuid.UUID):
        from sqlalchemy import select
        from app.models.identity import UserSession
        
        result = await db.execute(
            select(UserSession)
            .filter(UserSession.id == session_id, UserSession.user_id == user_id)
        )
        session = result.scalars().first()
        if session:
            session.is_revoked = True
            db.add(session)
            await db.commit()

auth_service = AuthService()
