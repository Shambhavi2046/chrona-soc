import os
import pytest

def test_startup_script_does_not_run_migrations():
    """
    Verify that start.sh has been stripped of unconditional alembic migration commands.
    In HA environments, running migrations inside the container startup process causes
    race conditions and schema deadlocks.
    """
    script_path = os.path.join(os.path.dirname(__file__), "../start.sh")
    assert os.path.exists(script_path), "start.sh must exist"
    
    with open(script_path, "r") as f:
        content = f.read()
        
    assert "alembic upgrade head" not in content, "start.sh must not run alembic migrations"
    assert "uvicorn" in content, "start.sh must still start the uvicorn server"
    assert "WORKERS=${WEB_CONCURRENCY:-2}" in content, "start.sh must configure workers via environment variable with a default"
    assert "--workers $WORKERS" in content, "start.sh must launch uvicorn with the configured worker count"
