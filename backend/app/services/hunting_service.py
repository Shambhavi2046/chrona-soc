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
        
    async def execute_hunt(self, db: AsyncSession, request: HuntQueryRequest) -> HuntExecuteResponse:
        from app.models.event_model import SecurityEvent
        from sqlalchemy import select, func, desc, asc, or_, String
        import json
        
        query = select(SecurityEvent)
        
        # Apply filters
        if request.ioc:
            ioc_q = f"%{request.ioc}%"
            query = query.filter(or_(
                SecurityEvent.ip_address.ilike(ioc_q),
                SecurityEvent.destination_ip.ilike(ioc_q),
                SecurityEvent.hostname.ilike(ioc_q),
                func.cast(SecurityEvent.raw_event, String).ilike(ioc_q)
            ))
            
        if request.hostname:
            query = query.filter(SecurityEvent.hostname.ilike(f"%{request.hostname}%"))
            
        if request.username:
            query = query.filter(SecurityEvent.user_account.ilike(f"%{request.username}%"))
            
        if request.severity:
            query = query.filter(SecurityEvent.severity.ilike(request.severity))
            
        # For JSON containment, depending on dialect, but we can do a simple string matching for now
        # since SQLite JSON operators might be limited, we'll cast to string if needed.
        if request.mitre_tactic:
            query = query.filter(func.cast(SecurityEvent.mitre_techniques, String).ilike(f"%{request.mitre_tactic}%"))
            
        if request.mitre_technique:
            query = query.filter(func.cast(SecurityEvent.mitre_techniques, String).ilike(f"%{request.mitre_technique}%"))
            
        if request.query:
            q = f"%{request.query}%"
            query = query.filter(or_(
                SecurityEvent.event_type.ilike(q),
                SecurityEvent.source.ilike(q),
                func.cast(SecurityEvent.raw_event, String).ilike(q),
                SecurityEvent.process_name.ilike(q),
                SecurityEvent.command_line.ilike(q)
            ))
            
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_res = await db.execute(count_query)
        total = total_res.scalar() or 0
        
        # Sorting
        if request.sort_by:
            # Map standard frontend sort keys to db columns
            sort_col_map = {
                "timestamp": SecurityEvent.timestamp,
                "severity": SecurityEvent.severity,
                "host": SecurityEvent.hostname,
                "source": SecurityEvent.source,
                "user": SecurityEvent.user_account
            }
            sort_col = sort_col_map.get(request.sort_by, SecurityEvent.timestamp)
            if request.sort_desc:
                query = query.order_by(desc(sort_col))
            else:
                query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(SecurityEvent.timestamp))
            
        # Pagination
        start = (request.page - 1) * request.page_size
        query = query.offset(start).limit(request.page_size)
        
        result = await db.execute(query)
        events_db = result.scalars().all()
        
        results = []
        for e in events_db:
            mitre_t = None
            if e.mitre_techniques and isinstance(e.mitre_techniques, list) and len(e.mitre_techniques) > 0:
                mitre_t = e.mitre_techniques[0]
            elif e.event_type == 'logon':
                mitre_t = 'Initial Access'
            elif e.event_type == 'process_creation':
                mitre_t = 'Execution'
            elif e.event_type == 'network_traffic':
                mitre_t = 'Command and Control'
                
            raw_data = e.raw_event if isinstance(e.raw_event, dict) else {}
            host = e.hostname or e.ip_address or raw_data.get('host') or raw_data.get('Computer') or "Unknown"
            user = e.user_account or raw_data.get('user') or raw_data.get('AccountName') or "Unknown"
            
            results.append(HuntEventSchema(
                id=str(e.id),
                timestamp=e.timestamp.isoformat() if e.timestamp else "",
                host=host,
                source=e.source or "Unknown",
                user=user,
                severity=e.severity or "Info",
                mitre_tactic=mitre_t,
                mitre_technique=mitre_t,
                ioc_match=e.ip_address or e.destination_ip,
                description=f"{e.event_type} - {e.process_name or e.command_line or ''}",
                status=e.status or "Logged",
                raw_log=json.dumps(e.raw_event) if e.raw_event else ""
            ))
            
        return HuntExecuteResponse(
            events=results,
            total=total,
            page=request.page,
            page_size=request.page_size
        )

    async def ask_copilot(self, db: AsyncSession, event_id: str) -> dict:
        import asyncio
        import uuid
        await asyncio.sleep(1.5) # Simulate AI thinking
        from app.models.event_model import SecurityEvent
        from sqlalchemy import select
        
        try:
            evt_uuid = uuid.UUID(event_id)
        except ValueError:
            return {"analysis": "Invalid event ID format."}
            
        query = select(SecurityEvent).where(SecurityEvent.id == evt_uuid)
        result = await db.execute(query)
        event = result.scalar_one_or_none()
        
        if not event:
            return {"analysis": "Event not found. Unable to provide analysis."}
            
        return {
            "analysis": f"AI Copilot Analysis for {event.event_type}:\n\nThis event appears to be part of a larger sequence. Based on the {event.source} logs, the user '{event.user_account or 'Unknown'}' performed an action on host '{event.hostname or 'Unknown'}'. I recommend correlating this with recent authentication attempts and checking for lateral movement indicators."
        }

hunting_service = HuntingService(saved_hunt_repo)
