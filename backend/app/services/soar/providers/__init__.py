from typing import Dict, Type
from app.services.soar.providers.base import IntegrationProvider
from app.services.soar.providers.threatfox import ThreatFoxProvider

PROVIDER_REGISTRY: Dict[str, Type[IntegrationProvider]] = {
    "threatfox": ThreatFoxProvider
}

def get_provider(name: str) -> IntegrationProvider:
    provider_class = PROVIDER_REGISTRY.get(name)
    if provider_class:
        return provider_class()
    return None
