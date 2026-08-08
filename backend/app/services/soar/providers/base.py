from abc import ABC, abstractmethod
from typing import Dict, Any

class IntegrationProvider(ABC):
    @abstractmethod
    async def execute(self, config: Dict[str, Any], secret: str, execution_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the provider logic.
        :param config: The configuration block from the node in the playbook.
        :param secret: The decrypted secret to use.
        :param execution_context: Variables from the playbook execution state.
        :return: A normalized dictionary that will be merged into the execution context.
        """
        pass
