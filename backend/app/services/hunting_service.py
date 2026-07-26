import uuid
import json
from datetime import datetime
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.services.base import BaseService
from app.repositories.hunting_repo import SavedHuntRepository, saved_hunt_repo
from app.schemas.hunting import SavedHuntCreate, SavedHuntUpdate, HuntQueryRequest, HuntExecuteResponse, HuntEventSchema
from app.models.hunting_model import SavedHunt

# Simulated telemetry dataset
MOCK_TELEMETRY = [
    {
        "id": "EVT-8374-291",
        "timestamp": datetime.utcnow().isoformat(),
        "host": "CORP-LAPTOP-042",
        "source": "CrowdStrike Falcon",
        "user": "jdoe",
        "severity": "Critical",
        "mitre_tactic": "Execution",
        "mitre_technique": "T1059.001 - PowerShell",
        "ioc_match": "powershell.exe -enc JABz...",
        "description": "Encoded PowerShell command executed",
        "status": "Open",
        "raw_log": '{"event": "ProcessExecution", "process": "powershell.exe", "commandLine": "powershell.exe -enc JABz...", "parent": "cmd.exe", "user": "jdoe", "host": "CORP-LAPTOP-042"}'
    },
    {
        "id": "EVT-8374-292",
        "timestamp": datetime.utcnow().isoformat(),
        "host": "DB-PROD-01",
        "source": "Windows Security Logs",
        "user": "SYSTEM",
        "severity": "High",
        "mitre_tactic": "Credential Access",
        "mitre_technique": "T1003.001 - LSASS Memory",
        "ioc_match": "rundll32.exe (comsvcs.dll)",
        "description": "Suspicious LSASS memory dump attempt",
        "status": "Investigating",
        "raw_log": '{"eventID": 4656, "process": "rundll32.exe", "target": "lsass.exe", "access": "0x1000", "user": "SYSTEM", "host": "DB-PROD-01"}'
    },
    {
        "id": "EVT-8374-293",
        "timestamp": datetime.utcnow().isoformat(),
        "host": "WEB-DMZ-EU",
        "source": "Linux Audit Logs",
        "user": "www-data",
        "severity": "Medium",
        "mitre_tactic": "Persistence",
        "mitre_technique": "T1053.003 - Cron",
        "description": "New crontab entry for www-data",
        "status": "Resolved",
        "raw_log": '{"type": "SYSCALL", "syscall": "open", "file": "/var/spool/cron/crontabs/www-data", "user": "www-data", "host": "WEB-DMZ-EU"}'
    },
    {
        "id": "EVT-8374-294",
        "timestamp": datetime.utcnow().isoformat(),
        "host": "FIREWALL-FW01",
        "source": "Palo Alto Networks",
        "user": "N/A",
        "severity": "Critical",
        "mitre_tactic": "Command & Control",
        "mitre_technique": "T1571 - Non-Standard Port",
        "ioc_match": "198.51.100.44",
        "description": "Outbound connection to known malicious C2 infrastructure",
        "status": "Open",
        "raw_log": '{"type": "TRAFFIC", "src_ip": "10.0.5.15", "dst_ip": "198.51.100.44", "dst_port": 4444, "action": "allow"}'
    },
    {
        "id": "EVT-8374-295",
        "timestamp": datetime.utcnow().isoformat(),
        "host": "CORP-DESKTOP-99",
        "source": "Okta",
        "user": "asmith",
        "severity": "High",
        "mitre_tactic": "Initial Access",
        "mitre_technique": "T1078 - Valid Accounts",
        "ioc_match": "203.0.113.15",
        "description": "Multiple failed logins followed by successful login (Impossible Travel)",
        "status": "Investigating",
        "raw_log": '{"event": "user.session.start", "outcome": "SUCCESS", "user": "asmith", "ip": "203.0.113.15", "location": "RU"}'
    }
]

class HuntingService(BaseService[SavedHuntRepository]):
    async def create_saved_hunt(self, db: AsyncSession, obj_in: SavedHuntCreate):
        return await self.repository.create(db, obj_in=obj_in)
        
    async def update_saved_hunt(self, db: AsyncSession, id: uuid.UUID, obj_in: SavedHuntUpdate):
        db_obj = await self.repository.get(db, id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved hunt not found")
            
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
            
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj
        
    async def delete_saved_hunt(self, db: AsyncSession, id: uuid.UUID):
        db_obj = await self.repository.get(db, id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved hunt not found")
        await db.delete(db_obj)
        await db.commit()
        
    def execute_hunt(self, request: HuntQueryRequest) -> HuntExecuteResponse:
        results = []
        for event in MOCK_TELEMETRY:
            # Apply filters
            if request.ioc and request.ioc.lower() not in (event.get("ioc_match", "") or "").lower():
                continue
            if request.hostname and request.hostname.lower() not in event["host"].lower():
                continue
            if request.username and request.username.lower() not in event["user"].lower():
                continue
            if request.severity and request.severity.lower() != event["severity"].lower():
                continue
            if request.mitre_tactic and request.mitre_tactic.lower() not in (event.get("mitre_tactic", "") or "").lower():
                continue
            if request.mitre_technique and request.mitre_technique.lower() not in (event.get("mitre_technique", "") or "").lower():
                continue
            if request.query:
                q = request.query.lower()
                # Basic full text search across common fields
                if q not in json.dumps(event).lower():
                    continue
            results.append(HuntEventSchema(**event))
            
        # Sorting
        if request.sort_by:
            # simple sort simulation
            desc = request.sort_desc
            results.sort(key=lambda x: getattr(x, request.sort_by, ""), reverse=desc)
            
        # Pagination
        total = len(results)
        start = (request.page - 1) * request.page_size
        end = start + request.page_size
        paginated_results = results[start:end]
        
        return HuntExecuteResponse(
            events=paginated_results,
            total=total,
            page=request.page,
            page_size=request.page_size
        )

hunting_service = HuntingService(saved_hunt_repo)
