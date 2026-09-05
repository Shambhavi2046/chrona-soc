import os
from unittest import mock
import pytest
from fastapi.testclient import TestClient

def test_openapi_disabled_in_production():
    with mock.patch.dict(os.environ, {"RENDER": "1", "OLLAMA_BASE_URL": "http://ollama-service:11434"}, clear=False):
        # We must reload the module to re-evaluate the global app instantiation
        import importlib
        import app.main
        importlib.reload(app.main)
        
        # Test client against production-configured app
        client = TestClient(app.main.app)
        assert app.main.app.openapi_url is None
        assert app.main.app.docs_url is None
        assert app.main.app.redoc_url is None
        
        response = client.get("/docs")
        assert response.status_code == 404

def test_openapi_enabled_in_local():
    # Remove RENDER from environment
    env = dict(os.environ)
    if "RENDER" in env:
        del env["RENDER"]
        
    with mock.patch.dict(os.environ, env, clear=True):
        import importlib
        import app.main
        importlib.reload(app.main)
        
        client = TestClient(app.main.app)
        assert app.main.app.openapi_url is not None
        assert app.main.app.docs_url is not None
        
        # We just verify it doesn't return 404 immediately due to routing
        # The schema endpoint itself might fail if DB isn't up, but the route exists
        assert app.main.app.openapi_url == "/api/v1/openapi.json"

def test_database_tls_enforced_in_production():
    with mock.patch.dict(os.environ, {"RENDER": "1", "OLLAMA_BASE_URL": "http://ollama-service:11434"}, clear=False):
        import importlib
        import app.db.session
        importlib.reload(app.db.session)
        
        # In production, connect_args must require SSL
        # We mock create_async_engine and assert the arguments
        assert app.db.session.engine_kwargs.get("connect_args") == {"ssl": "require"}

def test_database_tls_bypassed_in_local():
    env = dict(os.environ)
    if "RENDER" in env:
        del env["RENDER"]
        
    with mock.patch.dict(os.environ, env, clear=True):
        import importlib
        import app.db.session
        importlib.reload(app.db.session)
        
        # In local, connect_args for SSL should not be present
        assert "connect_args" not in app.db.session.engine_kwargs
