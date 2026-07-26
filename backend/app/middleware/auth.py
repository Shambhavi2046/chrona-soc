from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.db.session import get_db
from app.repositories.user import user_repo
from app.models.identity import User
from typing import List

security = HTTPBearer()

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = verify_token(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
        
    user = await user_repo.get_with_roles(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if user.status != "Active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        
    return user

def require_permissions(required_permissions: List[str]):
    async def permission_dependency(current_user: User = Depends(get_current_user)):
        # Super Admin has all permissions implicitly or explicitly
        user_permissions = set()
        for role in current_user.roles:
            if role.name == "Super Admin":
                return current_user
            user_permissions.update(role.permissions)
            
        for req_perm in required_permissions:
            if req_perm not in user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN, 
                    detail=f"Not enough permissions: requires {req_perm}"
                )
        return current_user
    return permission_dependency
