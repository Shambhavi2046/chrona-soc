import pytest
import uuid
import json
from datetime import datetime
from app.services.soar.context import ExecutionContext
from app.services.soar.engine import ExecutionEngine
from app.services.soar.actions import LogActionHandler, SetVariableActionHandler, ConditionActionHandler

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

def test_engine_unsupported_action():
    context = ExecutionContext("exec-1", "pb-1")
    actions = [{"type": "launch_missiles", "config": {}}]
    engine = ExecutionEngine(context, actions)
    status = engine.execute_all()
    assert status == "Failed"
    assert engine.execution_logs[-1]["message"].startswith("Unsupported action type")

def test_engine_full_workflow():
    context = ExecutionContext("exec-1", "pb-1")
    actions = [
        {"type": "log", "config": {"message": "Starting workflow"}},
        {"type": "set_variable", "config": {"name": "is_admin", "value": True}},
        {"type": "condition", "config": {"variable": "is_admin", "operator": "equals", "value": True}},
        {"type": "log", "config": {"message": "Admin check passed"}}
    ]
    engine = ExecutionEngine(context, actions)
    status = engine.execute_all()
    assert status == "Success"
    
    # 1 init, 4 actions, 1 complete
    assert len(engine.execution_logs) == 6
    assert engine.execution_logs[-1]["step"] == "Workflow Complete"
