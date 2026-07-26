from app.models.event_model import SecurityEvent

# Simulated IOC feed for Phase 2E.2
MOCK_IOCS = {
    "185.15.22.1": {"type": "ip", "threat": "C2 Server", "confidence": 95},
    "45.22.11.9": {"type": "ip", "threat": "Known Scanner", "confidence": 80},
    "a1b2c3d4e5f6g7h8i9j0": {"type": "hash", "threat": "Ransomware", "confidence": 100}
}

class IOCMatcher:
    @staticmethod
    def check_event(event: SecurityEvent) -> dict:
        """
        Check event fields against known IOCs.
        Returns a dict of matched IOCs if found.
        """
        matches = {}
        
        # Check IP addresses
        if event.ip_address and event.ip_address in MOCK_IOCS:
            matches[event.ip_address] = MOCK_IOCS[event.ip_address]
            
        if event.destination_ip and event.destination_ip in MOCK_IOCS:
            matches[event.destination_ip] = MOCK_IOCS[event.destination_ip]
            
        # Check hashes if present in normalized data
        if event.normalized_data and "hash" in event.normalized_data:
            file_hash = event.normalized_data["hash"]
            if file_hash in MOCK_IOCS:
                matches[file_hash] = MOCK_IOCS[file_hash]
                
        return matches

ioc_matcher = IOCMatcher()
