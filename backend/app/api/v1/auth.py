from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.auth import auth_service
from app.services.user import user_service
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse
from app.middleware.auth import get_current_user
from app.models.identity import User
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    return await user_service.create_user(db, user_in=user_in)

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """OAuth2 compatible token login, get an access token for future requests."""
    user = await auth_service.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    if user.status != "Active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
        
    device_info = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None
    
    token = await auth_service.create_session(db, str(user.id), device_info, ip_address)
    
    # Optionally set refresh token in cookie for security
    response.set_cookie(
        key="refresh_token", 
        value=token.refresh_token, 
        httponly=True, 
        secure=True, 
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
    
    return token

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
        
    # Validation logic omitted for brevity in Phase 2C
    # In production, check UserSession table to ensure it's not revoked
    
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Refresh logic not fully implemented yet")

@router.post("/logout")
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Logout current user by revoking refresh token."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await auth_service.logout(db, refresh_token)
        response.delete_cookie("refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged in user details."""
    return current_user
