import pytest
import uuid
import json
from unittest.mock import patch, AsyncMock, MagicMock
from app.schemas.copilot_schema import ChatRequestSchema, ChatMessageSchema
from app.services.copilot_service import process_chat
from app.core.config import settings
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_copilot_service_ollama_path():
    db_mock = MagicMock()
    # Mock no active context case for simplicity
    db_mock.query.return_value.filter.return_value.first.return_value = None
    db_mock.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []

    org_id = uuid.uuid4()
    request = ChatRequestSchema(prompt="Hello", history=[])

    mock_response = MagicMock()
    # Provide the exact JSON schema expected by the parser
    mock_response.json.return_value = {
        "message": {
            "content": json.dumps({
                "response": "Hello from mock",
                "suggested_prompts": [],
                "quick_actions": []
            })
        }
    }
    mock_response.raise_for_status.return_value = None

    with patch("app.core.config.settings.LLM_PROVIDER", "ollama"), \
         patch("app.core.config.settings.OLLAMA_BASE_URL", "http://mock-ollama:11434"), \
         patch("app.core.config.settings.OLLAMA_MODEL", "mock-qwen"), \
         patch("httpx.AsyncClient.post", return_value=mock_response) as mock_post:

        response = await process_chat(db_mock, request, org_id)

        assert response.response == "Hello from mock"

        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args

        assert call_args[0] == "http://mock-ollama:11434/api/chat"
        payload = call_kwargs.get("json")

        assert payload["model"] == "mock-qwen"
        assert payload["stream"] is False

        # Verify no sensitive telemetry fields like raw_event exist in payload
        payload_str = json.dumps(payload)
        assert "raw_event" not in payload_str
        assert "command_line" not in payload_str

@pytest.mark.asyncio
async def test_copilot_service_failure_raises_503():
    db_mock = MagicMock()
    db_mock.query.return_value.filter.return_value.first.return_value = None
    db_mock.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []

    org_id = uuid.uuid4()
    request = ChatRequestSchema(prompt="Hello", history=[])

    # Mock httpx throwing an exception
    with patch("app.core.config.settings.LLM_PROVIDER", "ollama"), \
         patch("httpx.AsyncClient.post", side_effect=Exception("Network timeout")):

        with pytest.raises(HTTPException) as exc_info:
            await process_chat(db_mock, request, org_id)

        assert exc_info.value.status_code == 503
        assert exc_info.value.detail == "AI provider unavailable"
