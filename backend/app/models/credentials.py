from sqlalchemy import Column, String, ForeignKey
from app.db.base_class import Base
from app.models.mixins import UUIDMixin, TimestampMixin

class IntegrationCredential(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "integration_credentials"

    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    encrypted_secret = Column(String, nullable=False)
    org_id = Column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
