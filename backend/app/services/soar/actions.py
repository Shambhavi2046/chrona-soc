from typing import Dict, Any
from app.services.soar.context import ExecutionContext

class ActionHandler:
    """Base class for all SOAR action handlers."""
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError("Subclasses must implement execute()")

class LogActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        message = config.get("message")
        if not message:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required field: 'message'"
            }
        
        return {
            "status": "success",
            "output": {},
            "message": str(message)
        }

class SetVariableActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        name = config.get("name")
        value = config.get("value")
        
        if not name:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required field: 'name'"
            }
            
        context.set_variable(name, value)
        
        return {
            "status": "success",
            "output": {"name": name, "value": value},
            "message": f"Variable '{name}' set successfully"
        }

class ConditionActionHandler(ActionHandler):
    def execute(self, context: ExecutionContext, config: Dict[str, Any]) -> Dict[str, Any]:
        variable = config.get("variable")
        operator = config.get("operator")
        expected_value = config.get("value")
        
        if not variable or not operator:
            return {
                "status": "failed",
                "output": {},
                "message": "Missing required fields: 'variable' or 'operator'"
            }
            
        actual_value = context.get_variable(variable)
        passed = False
        
        if operator == "equals":
            passed = actual_value == expected_value
        elif operator == "not_equals":
            passed = actual_value != expected_value
        elif operator == "contains":
            if isinstance(actual_value, (str, list, dict)):
                passed = expected_value in actual_value
            else:
                passed = False
        elif operator == "exists":
            passed = actual_value is not None
        else:
            return {
                "status": "failed",
                "output": {},
                "message": f"Unsupported operator: '{operator}'"
            }
            
        return {
            "status": "success" if passed else "failed",
            "output": {
                "variable": variable,
                "operator": operator,
                "expected": expected_value,
                "actual": actual_value,
                "passed": passed
            },
            "message": f"Condition evaluated to {passed}"
        }

ACTION_REGISTRY: Dict[str, ActionHandler] = {
    "log": LogActionHandler(),
    "set_variable": SetVariableActionHandler(),
    "condition": ConditionActionHandler()
}
