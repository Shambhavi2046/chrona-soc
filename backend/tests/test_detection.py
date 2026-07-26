import pytest
import uuid
import app.db.base  # Ensure all models are loaded for SQLAlchemy mappers
from app.models.event_model import SecurityEvent
from app.services.detection.rules.brute_force import BruteForceRule
from app.services.detection.rules.suspicious_powershell import SuspiciousPowerShellRule
from app.services.detection.correlation import correlation_service
from app.services.detection.ioc import ioc_matcher
from app.services.detection.risk import risk_scoring_service

@pytest.mark.asyncio
async def test_brute_force_rule():
    rule = BruteForceRule()
    # Should match
    event = SecurityEvent(event_type="logon", status="failure", normalized_data={"threat": "brute_force"})
    assert await rule.evaluate(event) is True
    
    # Should not match
    event2 = SecurityEvent(event_type="logon", status="success", normalized_data={"threat": "none"})
    assert await rule.evaluate(event2) is False

@pytest.mark.asyncio
async def test_powershell_rule():
    rule = SuspiciousPowerShellRule()
    # Should match
    event = SecurityEvent(
        event_type="process_creation", 
        process_name="powershell.exe", 
        command_line="powershell.exe -EncodedCommand JABz"
    )
    assert await rule.evaluate(event) is True

def test_risk_scoring():
    score = risk_scoring_service.calculate_risk_score(severity="critical", confidence=90, asset_criticality=2)
    # base 100 * 0.9 = 90 + 10 = 100
    assert score == 100
    
    score2 = risk_scoring_service.calculate_risk_score(severity="medium", confidence=50, asset_criticality=1)
    # base 50 * 0.5 = 25
    assert score2 == 25

def test_ioc_matching():
    event = SecurityEvent(ip_address="185.15.22.1")
    matches = ioc_matcher.check_event(event)
    assert "185.15.22.1" in matches
    assert matches["185.15.22.1"]["threat"] == "C2 Server"
