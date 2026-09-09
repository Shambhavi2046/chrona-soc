import pytest
import uuid
import json
from unittest.mock import patch, MagicMock
from app.schemas.copilot_schema import ChatRequestSchema, ChatResponseSchema
from app.services.copilot_service import process_chat
from app.models.operations import Alert, Case
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_a_copilot_alert_context_nullable_fields():
    db_mock = MagicMock()
    org_id = uuid.uuid4()
    alert_id = uuid.uuid4()
    
    # 1. Setup mock Alert with nullable fields explicitly set to None
    mock_alert = MagicMock(spec=Alert)
    mock_alert.id = alert_id
    mock_alert.org_id = org_id
    mock_alert.title = "Nullable Field Alert"
    mock_alert.severity = "high"
    mock_alert.risk_score = None  # This caused the crash previously
    mock_alert.status = None
    mock_alert.description = None
    mock_alert.mitre_mapping = None
    mock_alert.related_events = None
    mock_alert.threat_type = None
    
    # Return None for Case, return mock_alert for Alert
    def mock_db_filter_first(*args, **kwargs):
        return mock_alert
    
    db_mock.query.return_value.filter.return_value.first.side_effect = [None, mock_alert, None] # Case (None), Alert (Found), Investigation (None)
    
    request = ChatRequestSchema(prompt=f"Analyze alert {alert_id}.", history=[])

    mock_response = MagicMock()
    mock_response.json.return_value = {
        "message": {
            "content": json.dumps({
                "response": "Analysis complete",
                "suggested_prompts": [],
                "quick_actions": []
            })
        }
    }
    mock_response.raise_for_status.return_value = None

    with patch("app.core.config.settings.LLM_PROVIDER", "ollama"), \
         patch("httpx.AsyncClient.post", return_value=mock_response):
        
        # If the fix works, ActiveContextSchema won't crash on risk_score=None
        response = await process_chat(db_mock, request, org_id)
        assert response.response == "Analysis complete"
        assert response.active_context is not None
        assert response.active_context.risk_score is None
        assert response.active_context.status is None

@pytest.mark.asyncio
async def test_b_copilot_generic_query_no_hallucination():
    db_mock = MagicMock()
    org_id = uuid.uuid4()
    
    # Return None for context_case and context_alert
    db_mock.query.return_value.filter.return_value.first.return_value = None
    # Return empty list for recent_cases and None for first()
    db_mock.query.return_value.filter.return_value.order_by.return_value.first.return_value = None
    db_mock.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
    
    request = ChatRequestSchema(prompt="Summarize the latest critical case please.", history=[])
    
    # With short-circuiting, process_chat should return immediately without calling LLM
    with patch("httpx.AsyncClient.post") as mock_post:
        response = await process_chat(db_mock, request, org_id)
        
        assert "no active Critical or High priority cases" in response.response
        mock_post.assert_not_called()

