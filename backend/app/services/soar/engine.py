from typing import List, Dict, Any
from datetime import datetime
from app.services.soar.context import ExecutionContext
from app.services.soar.actions import ACTION_REGISTRY

class ExecutionEngine:
    def __init__(self, context: ExecutionContext, actions: List[Dict[str, Any]]):
        self.context = context
        self.actions = actions
        self.execution_logs: List[Dict[str, Any]] = []

    def execute_all(self) -> str:
        """Executes all actions and returns the final status."""
        self.execution_logs.append({
            "step": "Initializing Execution Engine",
            "status": "Success",
            "time": datetime.utcnow().isoformat() + "Z"
        })

        for index, action_node in enumerate(self.actions):
            action_type = action_node.get("type")
            config = action_node.get("config", {})

            step_title = f"Action {index + 1}: {action_type}"

            if not action_type:
                self.execution_logs.append({
                    "step": step_title,
                    "status": "Failed",
                    "time": datetime.utcnow().isoformat() + "Z",
                    "message": "Action type missing"
                })
                return "Failed"

            handler = ACTION_REGISTRY.get(action_type)
            if not handler:
                self.execution_logs.append({
                    "step": step_title,
                    "status": "Failed",
                    "time": datetime.utcnow().isoformat() + "Z",
                    "message": f"Unsupported action type: '{action_type}'"
                })
                return "Failed"

            # Execute the action
            try:
                result = handler.execute(self.context, config)
            except Exception as e:
                result = {
                    "status": "failed",
                    "output": {},
                    "message": f"Unhandled exception: {str(e)}",
                    "error": str(e)
                }

            log_entry = {
                "step": step_title,
                "status": "Success" if result.get("status") == "success" else "Failed",
                "time": datetime.utcnow().isoformat() + "Z",
                "message": result.get("message", "No message provided"),
                "output": result.get("output", {})
            }
            if "error" in result:
                log_entry["error"] = result["error"]

            self.execution_logs.append(log_entry)

            if result["status"] == "failed":
                return "Failed"

        self.execution_logs.append({
            "step": "Workflow Complete",
            "status": "Success",
            "time": datetime.utcnow().isoformat() + "Z"
        })

        return "Success"
