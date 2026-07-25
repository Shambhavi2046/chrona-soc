from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)

    source = Column(String, nullable=False)

    event = Column(String, nullable=False)

    severity = Column(String, nullable=False)

    timestamp = Column(DateTime, nullable=False)