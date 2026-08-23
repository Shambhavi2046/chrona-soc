from sqlalchemy import Column, String, ForeignKey, JSON, Boolean, DateTime, Integer
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.models.mixins import UUIDMixin, TimestampMixin, SoftDeleteMixin

class Organization(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False, unique=True, index=True)
    plan = Column(String(50), default="Standard")
    status = Column(String(50), default="Active")
    
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")

class UserRole(Base, TimestampMixin):
    __tablename__ = "user_roles"
    
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)

class Role(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "roles"

    name = Column(String(100), nullable=False)
    description = Column(String(255))
    permissions = Column(JSON, default=list)
    org_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)

    @property
    def is_system(self) -> bool:
        return self.org_id is None

    users = relationship("User", secondary="user_roles", back_populates="roles")

class User(Base, UUIDMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="Active")
    mfa_enabled = Column(Boolean, default=False)
    org_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    session_version = Column(Integer, default=1, nullable=False)

    organization = relationship("Organization", back_populates="users")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class UserSession(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "user_sessions"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    device_info = Column(String(255))
    ip_address = Column(String(50))
    is_revoked = Column(Boolean, default=False)

    user = relationship("User", back_populates="sessions")

class AuditLog(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    user_id = Column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    org_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=True, index=True)
    action = Column(String(100), nullable=False, index=True)
    resource = Column(String(255), nullable=False)
    ip_address = Column(String(50))
    status = Column(String(50))
    details = Column(JSON, default=dict)

    user = relationship("User", back_populates="audit_logs")

class PasswordResetToken(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "password_reset_tokens"

    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)

    user = relationship("User")

