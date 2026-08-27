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



class HuntingService(BaseService[SavedHuntRepository]):
    async def create_saved_hunt(self, db: AsyncSession, obj_in: SavedHuntCreate, org_id: uuid.UUID):
        obj_in_data = obj_in.model_dump()
        obj_in_data["org_id"] = org_id
        db_obj = self.repository.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update_saved_hunt(self, db: AsyncSession, id: uuid.UUID, obj_in: SavedHuntUpdate, org_id: uuid.UUID):
        from sqlalchemy import select
        result = await db.execute(select(self.repository.model).filter_by(id=id, org_id=org_id))
        db_obj = result.scalar_one_or_none()

        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved hunt not found")

        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete_saved_hunt(self, db: AsyncSession, id: uuid.UUID, org_id: uuid.UUID):
        from sqlalchemy import select
        result = await db.execute(select(self.repository.model).filter_by(id=id, org_id=org_id))
        db_obj = result.scalar_one_or_none()
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved hunt not found")
        await db.delete(db_obj)
        await db.commit()

    async def execute_hunt(self, db: AsyncSession, request: HuntQueryRequest, tenant_id: uuid.UUID) -> HuntExecuteResponse:
        from app.models.event_model import SecurityEvent
        from sqlalchemy import select, func, desc, asc, or_, String
        import json

        query = select(SecurityEvent).where(SecurityEvent.tenant_id == tenant_id)

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
            if request.query.strip() == "*":
                pass
            else:
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

    async def ask_copilot(self, db: AsyncSession, event_id: str, tenant_id: uuid.UUID) -> dict:
        import uuid
        import httpx
        import logging
        from app.models.event_model import SecurityEvent
        from sqlalchemy import select
        from app.core.config import settings

        try:
            evt_uuid = uuid.UUID(event_id)
        except ValueError:
            return {"analysis": "Invalid event ID format."}

        query = select(SecurityEvent).where(
            SecurityEvent.id == evt_uuid,
            SecurityEvent.tenant_id == tenant_id
        )
        result = await db.execute(query)
        event = result.scalar_one_or_none()

        if not event:
            return {"analysis": "Event not found. Unable to provide analysis."}

        # Safe structured fields boundary: Excludes raw_event, normalized_data, command_line
        event_data = {
            "event_type": event.event_type,
            "source": event.source,
            "vendor": event.vendor,
            "product": event.product,
            "severity": event.severity,
            "status": event.status,
            "hostname": event.hostname,
            "user_account": event.user_account,
            "ip_address": event.ip_address,
            "destination_ip": event.destination_ip,
            "mitre_techniques": event.mitre_techniques
        }

        # Safely format non-null fields
        context_str = "\n".join(f"{k}: {v}" for k, v in event_data.items() if v is not None)

        system_prompt = (
            "You are a Threat Hunting forensic analyst AI. "
            "Analyze the provided structured security event metadata. "
            "Identify what the event represents, why it may be security-relevant, the likely risk/severity, "
            "relevant MITRE ATT&CK interpretation, indicators or entities worth investigating, and recommended next steps. "
            "Distinguish observed facts from hypotheses. Do NOT invent facts not present in the data."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Please analyze this security event metadata:\n\n{context_str}"}
        ]

        if getattr(settings, "LLM_PROVIDER", "").lower() == "ollama":
            url = f"{settings.OLLAMA_BASE_URL.rstrip('/')}/api/chat"
            payload = {
                "model": settings.OLLAMA_MODEL,
                "messages": messages,
                "stream": False
            }
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    response = await client.post(url, json=payload)
                    response.raise_for_status()
                    result_json = response.json()
                    analysis_text = result_json.get("message", {}).get("content", "No analysis generated.")
                    return {"analysis": analysis_text}
            except Exception as e:
                from fastapi import HTTPException
                if isinstance(e, HTTPException):
                    raise e
                logging.error(f"Threat Hunting LLM Error: {str(e)}")
                raise HTTPException(status_code=503, detail="AI provider unavailable")

        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="AI provider unavailable")

hunting_service = HuntingService(saved_hunt_repo)
