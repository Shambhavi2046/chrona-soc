from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)

    log_id = Column(Integer, nullable=False)

    threat_type = Column(String, nullable=False)

    risk_score = Column(Integer, nullable=False)

    status = Column(
        String,
        default="open",
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )