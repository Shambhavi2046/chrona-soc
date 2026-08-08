import pytest
import uuid
import json
from datetime import datetime
from app.services.soar.context import ExecutionContext
from app.services.soar.engine import ExecutionEngine
from app.services.soar.actions import LogActionHandler, SetVariableActionHandler, ConditionActionHandler, HTTPRequestActionHandler
import httpx
def test_log_action_success():
    context = ExecutionContext("exec-1", "pb-1")
    handler = LogActionHandler()
    res = handler.execute(context, {"message": "Test log message"})
    assert res["status"] == "success"
    assert res["message"] == "Test log message"

def test_set_variable_success():
    context = ExecutionContext("exec-1", "pb-1")
    handler = SetVariableActionHandler()
    res = handler.execute(context, {"name": "risk_score", "value": 90})
    assert res["status"] == "success"
    assert context.get_variable("risk_score") == 90

def test_condition_equals_success():
    context = ExecutionContext("exec-1", "pb-1")
    context.set_variable("severity", "high")
    handler = ConditionActionHandler()
    res = handler.execute(context, {"variable": "severity", "operator": "equals", "value": "high"})
    assert res["status"] == "success"
    assert res["output"]["passed"] is True

def test_condition_equals_failure():
    context = ExecutionContext("exec-1", "pb-1")
    context.set_variable("severity", "low")
    handler = ConditionActionHandler()
    res = handler.execute(context, {"variable": "severity", "operator": "equals", "value": "high"})
    assert res["status"] == "failed"
    assert res["output"]["passed"] is False

def test_condition_contains():
    context = ExecutionContext("exec-1", "pb-1")
    context.set_variable("tags", ["malware", "phishing"])
    handler = ConditionActionHandler()
    res = handler.execute(context, {"variable": "tags", "operator": "contains", "value": "phishing"})
    assert res["status"] == "success"

def test_invalid_action_config():
    context = ExecutionContext("exec-1", "pb-1")
    handler = LogActionHandler()
    res = handler.execute(context, {}) # Missing message
    assert res["status"] == "failed"
    assert "Missing required field" in res["message"]

@pytest.mark.asyncio
async def test_engine_unsupported_action():
    from unittest.mock import AsyncMock, MagicMock
    context = ExecutionContext("exec-1", "pb-1")
    actions = [{"type": "launch_missiles", "config": {}}]
    engine = ExecutionEngine(context, actions)

    db_mock = AsyncMock()
    exec_mock = MagicMock()
    exec_mock.status = "Running"
    db_mock.get.return_value = exec_mock

    status = await engine.execute_all(db_mock, "exec-1")
    assert status == "Failed"
    assert engine.execution_logs[-1]["message"].startswith("Unsupported action type")

@pytest.mark.asyncio
async def test_engine_full_workflow():
    from unittest.mock import AsyncMock, MagicMock
    context = ExecutionContext("exec-1", "pb-1")
    actions = [
        {"type": "log", "config": {"message": "Starting workflow"}},
        {"type": "set_variable", "config": {"name": "is_admin", "value": True}},
        {"type": "condition", "config": {"variable": "is_admin", "operator": "equals", "value": True}},
        {"type": "log", "config": {"message": "Admin check passed"}}
    ]
    engine = ExecutionEngine(context, actions)

    db_mock = AsyncMock()
    exec_mock = MagicMock()
    exec_mock.status = "Running"
    db_mock.get.return_value = exec_mock

    status = await engine.execute_all(db_mock, "exec-1")
    assert status == "Success"

    # 1 init, 4 actions, 1 complete
    assert len(engine.execution_logs) == 6
    assert engine.execution_logs[-1]["step"] == "Workflow Complete"

def test_http_request_success(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('93.184.216.34', 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    class MockResponse:
        status_code = 200
        def json(self): return {"result": "success"}

    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('93.184.216.34', 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    class MockClient:
        def __init__(self, *args, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def request(self, *args, **kwargs): return MockResponse()

    monkeypatch.setattr(httpx, "Client", MockClient)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "https://api.example.com", "method": "POST"})

    assert res["status"] == "success"
    assert res["output"]["status_code"] == 200
    assert res["output"]["body"] == {"result": "success"}

def test_http_request_invalid_url():
    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "ftp://api.example.com"})
    assert res["status"] == "failed"
    assert "start with http" in res["message"]

def test_http_request_forbidden_header():
    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {
        "url": "https://api.example.com",
        "headers": {"Authorization": "Bearer secret"}
    })
    assert res["status"] == "failed"
    assert "forbidden" in res["message"]

def test_http_request_timeout(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('93.184.216.34', 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    class MockClient:
        def __init__(self, *args, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def request(self, *args, **kwargs): raise httpx.TimeoutException("Timeout")

    monkeypatch.setattr(httpx, "Client", MockClient)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "https://api.example.com", "timeout": 1})
    assert res["status"] == "failed"
    assert "timed out" in res["message"]

def test_http_request_non_success(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('93.184.216.34', 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    class MockResponse:
        status_code = 404
        def json(self): return {"error": "not found"}

    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('93.184.216.34', 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    class MockClient:
        def __init__(self, *args, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def request(self, *args, **kwargs): return MockResponse()

    monkeypatch.setattr(httpx, "Client", MockClient)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "https://api.example.com"})
    assert res["status"] == "failed"
    assert res["output"]["status_code"] == 404

def test_http_request_ssrf_blocked_localhost(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('127.0.0.1', 80))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "http://localhost:8000"})
    assert res["status"] == "failed"
    assert "SSRF Protection" in res["message"]
    assert "is blocked" in res["message"]

def test_http_request_ssrf_blocked_private_ip(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, '', ('192.168.1.1', 80))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "http://192.168.1.1"})
    assert res["status"] == "failed"
    assert "SSRF Protection" in res["message"]
    assert "is blocked" in res["message"]

def test_http_request_dns_failure(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        raise socket.gaierror("[Errno 8] nodename nor servname provided")
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    context = ExecutionContext("exec-1", "pb-1")
    handler = HTTPRequestActionHandler()
    res = handler.execute(context, {"url": "https://api.thisdoesntexist.local"})
    assert res["status"] == "failed"
    assert "DNS Resolution Failed" in res["message"]
