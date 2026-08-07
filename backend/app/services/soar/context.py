from typing import Dict, Any

class ExecutionContext:
    def __init__(self, execution_id: str, playbook_id: str, initiated_by: str = "System"):
        self.execution_id = execution_id
        self.playbook_id = playbook_id
        self.initiated_by = initiated_by
        
        # Scoped runtime variables strictly for this execution
        self.variables: Dict[str, Any] = {}
        
        # Optionally populate alert_data or metadata if invoked from an alert
        self.alert_data: Dict[str, Any] = {}
        self.metadata: Dict[str, Any] = {}

    def get_variable(self, name: str, default: Any = None) -> Any:
        return self.variables.get(name, default)

    def set_variable(self, name: str, value: Any) -> None:
        self.variables[name] = value

    def to_dict(self) -> dict:
        return {
            "execution_id": self.execution_id,
            "playbook_id": self.playbook_id,
            "variables": self.variables,
            "metadata": self.metadata
        }
