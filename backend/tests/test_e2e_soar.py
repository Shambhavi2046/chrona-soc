from app.main import app
import pytest
from fastapi.testclient import TestClient

def test_e2e_playbook_execution(monkeypatch):
    import socket
    def mock_getaddrinfo(*args, **kwargs):
        return [(2, 1, 6, "", ("93.184.216.34", 443))]
    monkeypatch.setattr(socket, "getaddrinfo", mock_getaddrinfo)

    from app.middleware import auth
    def mock_verify_token(token):
        return {"sub": "12345678-1234-5678-1234-567812345678"}
    monkeypatch.setattr(auth, "verify_token", mock_verify_token)

    from app.repositories.user import user_repo
    from app.models.identity import User
    import uuid
    async def mock_get_with_roles(db, user_id):
        import uuid
        user_uuid = user_id if isinstance(user_id, uuid.UUID) else uuid.UUID(user_id)
        return User(id=user_uuid, email="test@chrona.local", name="Test User", status="Active")
    monkeypatch.setattr(user_repo, "get_with_roles", mock_get_with_roles)

    class MockResponse:
        status_code = 200
        def json(self): return {"result": "success"}
    class MockClient:
        def __init__(self, *args, **kwargs): pass
        def __enter__(self): return self
        def __exit__(self, *args): pass
        def request(self, *args, **kwargs): return MockResponse()
    import httpx
    monkeypatch.setattr(httpx, "Client", MockClient)

    with TestClient(app) as client:
        headers = {"Authorization": "Bearer fake_token"}

        # 1. Create a Playbook using the new nodes contract
        nodes = [
            { "id": 1, "category": "Trigger", "type": "log", "config": { "message": "Trigger: Email Alert Received" } },
            { "id": 2, "category": "Action", "type": "set_variable", "config": { "name": "investigation_started", "value": True } },
            { "id": 3, "category": "Integration", "type": "http_request", "config": { "url": "https://api.github.com/zen", "method": "GET", "timeout": 5 } },
            { "id": 4, "category": "Decision", "type": "condition", "config": { "variable": "investigation_started", "operator": "equals", "value": True } },
            { "id": 5, "category": "Action", "type": "log", "config": { "message": "Quarantine User Action Executed" } }
        ]

        import uuid
        payload = {
            "name": f"E2E Test Playbook {uuid.uuid4()}",
            "description": "Testing E2E",
            "category": "Test",
            "trigger_type": "Manual",
            "status": "Active",
            "definition": {"nodes": nodes}
        }

        create_res = client.post("/api/v1/soar/playbooks", json=payload, headers=headers)
        assert create_res.status_code == 200
        pb = create_res.json()
        pb_id = pb["id"]

        # 2. Execute the Playbook
        exec_res = client.post(f"/api/v1/soar/playbooks/{pb_id}/execute", headers=headers)
        assert exec_res.status_code == 200
        execution = exec_res.json()
        assert execution["status"] == "Running"
        exec_id = execution["id"]

        import time
        # Poll for completion
        for _ in range(10):
            res = client.get(f"/api/v1/soar/executions/{exec_id}", headers=headers)
            execution = res.json()
            if execution["status"] != "Running":
                break
            time.sleep(0.5)

        assert execution["status"] == "Success"
        assert "execution_logs" in execution
        logs = execution["execution_logs"]

        assert len(logs) == 7
        assert logs[0]["step"] == "Initializing Execution Engine"
        assert logs[-1]["step"] == "Workflow Complete"

        http_log = logs[3]
        assert http_log["step"] == "Action 3: http_request"
        assert http_log["status"] == "Success"
        assert http_log["output"]["status_code"] == 200
        assert "body" in http_log["output"]
