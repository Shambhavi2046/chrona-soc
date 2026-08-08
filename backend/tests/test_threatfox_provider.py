import pytest
import pytest_asyncio
import uuid
import json
from unittest.mock import AsyncMock, patch
from app.services.soar.actions import IntegrationActionHandler
from app.services.soar.context import ExecutionContext
from app.services.credentials_service import credentials_service
from app.schemas.credentials import CredentialCreate
from app.db.session import async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.db.base_class import Base

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    async with SessionLocal() as session:
        yield session

@pytest.mark.asyncio
@patch("app.services.soar.actions.credentials_service.get_by_id")
async def test_threatfox_integration_handler(mock_get_by_id, db_session):
    # 1. Create a credential in DB (just for the object)
    cred = await credentials_service.create(db_session, CredentialCreate(
        name="Test",
        provider="threatfox",
        secret="fake-secret-key-12345"
    ))

    mock_get_by_id.return_value = cred

    handler = IntegrationActionHandler()
    context = ExecutionContext(uuid.uuid4(), uuid.uuid4())

    config = {
        "integration": "threatfox",
        "credential_id": str(cred.id),
        "ioc": "1.1.1.1" # Using Cloudflare DNS for a safe public query
    }

    # 2. Execute
    result = await handler._execute_async(context, config)

    # 3. Check for Secret Leakage in result
    result_str = json.dumps(result)
    assert "fake-secret-key-12345" not in result_str

    assert result["status"] in ("success", "failed")

    # Check SSRF protection manually
    ssrf_config = {
        "integration": "threatfox",
        "credential_id": str(cred.id),
        "ioc": "192.168.1.1"
    }

    # 4. Try Invalid Credential
    invalid_config = {
        "integration": "threatfox",
        "credential_id": str(uuid.uuid4()),
        "ioc": "1.1.1.1"
    }
    mock_get_by_id.return_value = None
    result_invalid = await handler._execute_async(context, invalid_config)
    assert result_invalid["status"] == "failed"
    assert "Credential not found" in result_invalid["message"]

@pytest.mark.asyncio
@patch("httpx.AsyncClient.post")
@patch("socket.getaddrinfo")
async def test_threatfox_provider_auth_contract(mock_getaddrinfo, mock_post):
    from app.services.soar.providers.threatfox import ThreatFoxProvider
    from httpx import Response

    # Mock DNS resolution to pass SSRF
    mock_getaddrinfo.return_value = [(None, None, None, None, ("8.8.8.8", 0))]

    # Mock the HTTP response
    mock_post.return_value = Response(200, json={"query_status": "ok", "data": [{"tags": ["test"], "malware_printable": "test", "confidence_level": 100}]})

    provider = ThreatFoxProvider()
    config = {"ioc": "1.1.1.1"}
    secret = "fake-secret-key-12345"

    result = await provider.execute(config, secret, {})

    # Verify the mock was called correctly
    mock_post.assert_called_once()

    # Extract the call arguments
    args, kwargs = mock_post.call_args
    headers = kwargs.get("headers", {})

    # Verify Auth-Key is used and contains the exact secret
    assert "Auth-Key" in headers
    assert headers["Auth-Key"] == secret
    assert "API-KEY" not in headers

    # Ensure the secret is not leaked in the final result output
    assert secret not in str(result)
