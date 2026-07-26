class RiskScoringService:
    SEVERITY_WEIGHT = {
        "info": 10,
        "low": 25,
        "medium": 50,
        "high": 75,
        "critical": 100
    }

    @classmethod
    def calculate_risk_score(cls, severity: str, confidence: int, asset_criticality: int = 1) -> int:
        """
        Calculate a consistent risk score based on severity, rule confidence, and asset criticality.
        Score range: 0-100
        """
        base_score = cls.SEVERITY_WEIGHT.get(severity.lower(), 50)
        
        # Adjust by confidence percentage
        adjusted_score = base_score * (confidence / 100.0)
        
        # Increase slightly for highly critical assets (up to max 100)
        if asset_criticality > 1:
            adjusted_score += 10
            
        return min(int(adjusted_score), 100)

risk_scoring_service = RiskScoringService()
