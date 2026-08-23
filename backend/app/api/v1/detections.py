from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.services.detection.rules import rule_registry
from app.middleware.auth import require_permissions
from app.models.identity import User

router = APIRouter()

@router.get("/rules", response_model=List[Dict[str, Any]])
async def list_detection_rules(
    current_user: User = Depends(require_permissions(["alerts:read"]))
):
    """List all active detection rules."""
    rules = rule_registry.get_all_rules()
    return [rule.metadata for rule in rules]
