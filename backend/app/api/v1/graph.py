from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.graph_schema import GraphTopologySchema
from app.services import graph_service
from app.middleware.auth import require_permissions
from app.models.identity import User

router = APIRouter()

@router.get("", response_model=GraphTopologySchema)
async def get_attack_graph(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_permissions(["graph:read"]))
):
    return await graph_service.generate_topology(db, org_id=current_user.org_id)
