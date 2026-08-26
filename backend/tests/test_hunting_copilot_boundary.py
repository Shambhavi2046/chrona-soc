import pytest
import uuid
import json
from unittest.mock import patch, AsyncMock
from app.models.event_model import SecurityEvent
from app.services.hunting_service import hunting_service
from app.core.config import settings

@pytest.mark.asyncio
async def test_hunting_copilot_security_boundary():
    # 1. Setup sentinels
    tenant_id = uuid.uuid4()
    event_id_str = str(uuid.uuid4())

    safe_event_type = "SAFE_EVENT_TYPE_SENTINEL"
    safe_hostname = "SAFE_HOSTNAME_SENTINEL"

    sensitive_raw_event = {"password": "SENSITIVE_RAW_EVENT_SENTINEL"}
    sensitive_normalized = {"token": "SENSITIVE_NORMALIZED_SENTINEL"}
    sensitive_command_line = "curl --password SENSITIVE_COMMAND_LINE_SENTINEL"

    # Create mock event
    mock_event = SecurityEvent(
        id=uuid.UUID(event_id_str),
        tenant_id=tenant_id,
        event_id="test_event_123",
        timestamp=None,
        source="SAFE_SOURCE",
        vendor=None, # Missing optional
        product="SAFE_PRODUCT",
        hostname=safe_hostname,
        asset=None,
        user_account="SAFE_USER",
        ip_address="192.168.1.1",
        destination_ip=None,
        process_name="SAFE_PROCESS",
        command_line=sensitive_command_line,
        event_type=safe_event_type,
        severity="high",
        status="blocked",
        raw_event=sensitive_raw_event,
        normalized_data=sensitive_normalized,
        mitre_techniques=["T1059"]
    )

    # 2. Mock DB Session
    from unittest.mock import MagicMock
    db_mock = AsyncMock()
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = mock_event
    db_mock.execute.return_value = result_mock

    # 3. Mock httpx.AsyncClient.post
    mock_response = MagicMock()
    mock_response.json.return_value = {"message": {"content": "Test Analysis Completed"}}
    mock_response.raise_for_status.return_value = None

    # Patch settings to ensure we take the Ollama path
    with patch("app.core.config.settings.LLM_PROVIDER", "ollama"), \
         patch("app.core.config.settings.OLLAMA_BASE_URL", "http://mock-ollama:11434"), \
         patch("app.core.config.settings.OLLAMA_MODEL", "mock-qwen"), \
         patch("httpx.AsyncClient.post", return_value=mock_response) as mock_post:

        # Execute the method
        response = await hunting_service.ask_copilot(db_mock, event_id_str, tenant_id)

        # 4. Verify the analysis was returned
        assert response == {"analysis": "Test Analysis Completed"}

        # 5. Extract the call arguments to httpx.post
        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args

        # Verify URL
        expected_url = "http://mock-ollama:11434/api/chat"
        assert call_args[0] == expected_url

        # Verify JSON payload
        payload = call_kwargs.get("json")
        assert payload is not None
        assert payload["model"] == "mock-qwen"
        assert payload["stream"] is False
        assert "messages" in payload

        messages = payload["messages"]
        assert len(messages) == 2
        user_message_content = messages[1]["content"]

        # Verify SAFE sentinels ARE present in the user message content specifically
        assert safe_event_type in user_message_content
        assert safe_hostname in user_message_content

        # Serialize the entire payload for global assertions
        payload_json = json.dumps(payload)

        # Verify SENSITIVE sentinels are NOT present anywhere in the payload
        assert "SENSITIVE_RAW_EVENT_SENTINEL" not in payload_json
        assert "SENSITIVE_NORMALIZED_SENTINEL" not in payload_json
        assert "SENSITIVE_COMMAND_LINE_SENTINEL" not in payload_json

        # Verify field names are NOT present anywhere in the payload
        assert "raw_event" not in payload_json
        assert "normalized_data" not in payload_json
        assert "command_line" not in payload_json
