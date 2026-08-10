import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock
from app.services.soar.engine import ExecutionEngine
from app.services.soar.context import ExecutionContext
import app.services.soar.actions as actions_module
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.models.automation import PlaybookExecution, Playbook
from app.db.base_class import Base
import uuid
import copy
from datetime import datetime

class SlowTestHandler:
    def execute(self, context, config):
        import time
        time.sleep(1)
        return {"status": "success", "message": "Slept"}

actions_module.ACTION_REGISTRY["slow_test"] = SlowTestHandler()

import pytest_asyncio

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with SessionLocal() as session:
        # Create a dummy playbook
        pb = Playbook(id=uuid.uuid4(), name="test", trigger_type="Manual", definition={"nodes": []}, org_id=uuid.uuid4())
        session.add(pb)
        await session.commit()

        exec_obj = PlaybookExecution(
            id=uuid.uuid4(),
            playbook_id=pb.id,
            status="Running",
            started_at=datetime.utcnow().isoformat() + "Z"
        )
        session.add(exec_obj)
        await session.commit()

        yield session, exec_obj, SessionLocal

@pytest.mark.asyncio
async def test_engine_pause_resume(db_session):
    session, exec_obj, SessionLocal = db_session

    context = ExecutionContext(exec_obj.id, exec_obj.playbook_id)
    actions = [
        {"type": "slow_test", "config": {}},
        {"type": "slow_test", "config": {}}
    ]
    engine = ExecutionEngine(context, actions)

    # Run the engine in the background with the primary session
    task = asyncio.create_task(engine.execute_all(session, exec_obj.id))

    await asyncio.sleep(0.1) # Let it start

    # Use a SECONDARY session to simulate another API request
    async with SessionLocal() as session2:
        exec_obj2 = await session2.get(PlaybookExecution, exec_obj.id)
        exec_obj2.status = "Paused"
        session2.add(exec_obj2)
        await session2.commit()

    await asyncio.sleep(1.5) # Wait for engine to detect pause and enter sleep loop

    # Check if it paused (it shouldn't have finished)
    assert not task.done()

    # Resume it from SECONDARY session
    async with SessionLocal() as session3:
        exec_obj3 = await session3.get(PlaybookExecution, exec_obj.id)
        exec_obj3.status = "Running"
        session3.add(exec_obj3)
        await session3.commit()

    # Wait for completion
    status = await asyncio.wait_for(task, timeout=5.0)
    assert status == "Success"

@pytest.mark.asyncio
async def test_engine_pause_cancel(db_session):
    session, exec_obj, SessionLocal = db_session

    context = ExecutionContext(exec_obj.id, exec_obj.playbook_id)
    actions = [
        {"type": "slow_test", "config": {}},
        {"type": "slow_test", "config": {}}
    ]
    engine = ExecutionEngine(context, actions)

    task = asyncio.create_task(engine.execute_all(session, exec_obj.id))

    await asyncio.sleep(0.1)

    # Pause it
    async with SessionLocal() as session2:
        exec_obj2 = await session2.get(PlaybookExecution, exec_obj.id)
        exec_obj2.status = "Paused"
        session2.add(exec_obj2)
        await session2.commit()

    await asyncio.sleep(1.5)

    # Cancel it
    async with SessionLocal() as session3:
        exec_obj3 = await session3.get(PlaybookExecution, exec_obj.id)
        exec_obj3.status = "Cancelled"
        session3.add(exec_obj3)
        await session3.commit()

    status = await asyncio.wait_for(task, timeout=5.0)
    assert status == "Cancelled"

@pytest.mark.asyncio
async def test_engine_running_cancel(db_session):
    session, exec_obj, SessionLocal = db_session

    context = ExecutionContext(exec_obj.id, exec_obj.playbook_id)
    actions = [
        {"type": "slow_test", "config": {}},
        {"type": "slow_test", "config": {}}
    ]
    engine = ExecutionEngine(context, actions)

    task = asyncio.create_task(engine.execute_all(session, exec_obj.id))

    await asyncio.sleep(0.1)

    # Cancel it while running
    async with SessionLocal() as session2:
        exec_obj2 = await session2.get(PlaybookExecution, exec_obj.id)
        exec_obj2.status = "Cancelled"
        session2.add(exec_obj2)
        await session2.commit()

    status = await asyncio.wait_for(task, timeout=5.0)
    assert status == "Cancelled"
