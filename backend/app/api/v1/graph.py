from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.schemas.graph_schema import GraphTopologySchema
from app.services import graph_service

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("", response_model=GraphTopologySchema)
def get_attack_graph(db: Session = Depends(get_db)):
    return graph_service.generate_topology(db)
