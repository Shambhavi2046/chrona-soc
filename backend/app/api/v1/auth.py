from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.services.auth import auth_service
from app.services.user import user_service
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse, ForgotPasswordRequest, ResetPasswordRequest, UserSessionResponse, RegistrationRequest
from app.middleware.auth import get_current_user
from app.models.identity import User
from app.core.config import settings

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(request_in: RegistrationRequest, db: AsyncSession = Depends(get_db)):
    """Register a new user and organization."""
    from app.repositories.user import user_repo
    from app.repositories.organization import organization_repo
    from app.repositories.role import role_repo
    from app.models.identity import Organization, UserRole
    from app.core.roles import Role as RoleEnum
    from app.core.security import get_password_hash

    # Check email exists
    existing_user = await user_repo.get_by_email(db, request_in.email)
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User with this email already exists")

    # Check org name exists
    existing_org = await organization_repo.get_by_name(db, request_in.org_name)
    if existing_org:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Organization with this name already exists")

    # Fetch Super Admin role (which acts as tenant admin)
    tenant_admin_role = await role_repo.get_by_name(db, RoleEnum.SUPER_ADMIN.value)
    if not tenant_admin_role:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="System roles not initialized")

    try:
        # Create Org
        org = Organization(name=request_in.org_name, plan="Standard", status="Active")
        db.add(org)
        await db.flush()

        # Create User
        db_user = user_repo.model(
            email=request_in.email,
            name=request_in.name,
            hashed_password=get_password_hash(request_in.password),
            org_id=org.id,
            status="Active"
        )
        db.add(db_user)
        await db.flush()

        # Assign Role
        db.add(UserRole(user_id=db_user.id, role_id=tenant_admin_role.id))

        await db.commit()
        await db.refresh(db_user, attribute_names=["roles"])
        return db_user
    except Exception as e:
        await db.rollback()
        # Do not expose internal db errors in production, but we can log them
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed due to an internal error")

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
    
    token = await auth_service.create_session(db, user.id, user.session_version, device_info, ip_address)
    
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
        
    return await auth_service.refresh_session(db, refresh_token)

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

import uuid

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Initiate password reset."""
    await auth_service.forgot_password(db, request.email)
    return {"message": "If that email is registered, a password reset link has been generated."}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Complete password reset."""
    await auth_service.reset_password(db, request.token, request.new_password)
    return {"message": "Password reset successfully."}

@router.get("/sessions", response_model=list[UserSessionResponse])
async def get_sessions(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List current active sessions."""
    return await auth_service.get_active_sessions(db, current_user.id)

@router.delete("/sessions/{session_id}")
async def revoke_session(session_id: uuid.UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Revoke a specific active session."""
    await auth_service.revoke_session(db, session_id, current_user.id)
    return {"message": "Session revoked"}

