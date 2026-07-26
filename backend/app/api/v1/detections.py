from fastapi import APIRouter
from typing import List, Dict, Any
from app.services.detection.rules import rule_registry

router = APIRouter()

@router.get("/rules", response_model=List[Dict[str, Any]])
async def list_detection_rules():
    """List all active detection rules."""
    rules = rule_registry.get_all_rules()
    return [rule.metadata for rule in rules]
