import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

# Create a mock auth dependency override that doesn't rely on DB
from app.models.identity import User
from app.middleware.auth import get_current_user

async def mock_get_current_user():
    user = User(
        email="admin@chrona.local",
        status="Active",
        roles=[]
    )
    import uuid
    user.org_id = uuid.uuid4()

    from app.models.identity import Role
    super_admin_role = Role(name="Super Admin")
    # Bypass SQLAlchemy relationship tracking issues for mock tests
    user.__dict__['roles'] = [super_admin_role]
    return user

@pytest.mark.asyncio
async def test_event_loop_unblocked(monkeypatch):
    """
    Test that the /copilot/chat endpoint, which performs synchronous blocking I/O,
    does not block the ASGI event loop and allows concurrent requests like /health
    to complete successfully.
    """
    app.dependency_overrides[get_current_user] = mock_get_current_user

    # Mock the asynchronous copilot_service.process_chat to sleep for 2 seconds
    from app.services import copilot_service
    import asyncio
    import time

    async def mock_process_chat(*args, **kwargs):
        await asyncio.sleep(2)  # Simulate blocking LLM generation
        from app.schemas.copilot_schema import ChatResponseSchema
        return ChatResponseSchema(
            response="Mocked LLM Response",
            suggested_prompts=[],
            quick_actions=[],
            active_context=None
        )

    monkeypatch.setattr(copilot_service, "process_chat", mock_process_chat)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:

        # Start the slow synchronous copilot request
        copilot_task = asyncio.create_task(
            client.post("/api/v1/copilot/chat", json={"prompt": "test", "history": []})
        )

        # Give it a tiny bit of time to hit the router and start sleeping
        await asyncio.sleep(0.1)

        # While copilot is blocked in time.sleep(2), try to hit /health
        # If the event loop is blocked, this will take ~1.9 seconds to resolve.
        # If the event loop is free (because copilot is in a threadpool), this will resolve instantly.
        health_start = time.time()
        health_res = await client.get("/api/v1/health")
        health_duration = time.time() - health_start

        assert health_res.status_code == 200
        # Assert that the health endpoint responded significantly faster than the 2s block
        assert health_duration < 1.0, f"Health endpoint was blocked! Took {health_duration}s"

        # Await the copilot response to ensure it finishes cleanly
        copilot_res = await copilot_task
        assert copilot_res.status_code == 200
        assert copilot_res.json()["response"] == "Mocked LLM Response"

    app.dependency_overrides.clear()
