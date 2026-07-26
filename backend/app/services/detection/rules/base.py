from abc import ABC, abstractmethod
from typing import Dict, Any
from app.models.event_model import SecurityEvent

class DetectionRule(ABC):
    """Abstract base class for all detection rules."""

    @property
    @abstractmethod
    def metadata(self) -> Dict[str, Any]:
        """
        Return structured metadata for the rule.
        Must include:
        - rule_id (str)
        - name (str)
        - version (str)
        - severity (str: "info", "low", "medium", "high", "critical")
        - confidence (int: 0-100)
        - description (str)
        - enabled (bool)
        """
        pass

    @abstractmethod
    async def evaluate(self, event: SecurityEvent) -> bool:
        """
        Evaluate a single security event against this rule.
        Returns True if the rule matches the event, False otherwise.
        """
        pass
