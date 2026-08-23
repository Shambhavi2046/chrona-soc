from typing import Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.services.base import BaseService
from app.repositories.operations import AlertRepository, InvestigationRepository, CaseRepository, EvidenceRepository
from app.repositories.operations import alert_repo, investigation_repo, case_repo, evidence_repo
from app.schemas.operations import AlertCreate, AlertUpdate, InvestigationCreate, InvestigationUpdate, CaseCreate, CaseUpdate, EvidenceCreate
import uuid

class AlertService(BaseService[AlertRepository]):
    async def create_alert(self, db: AsyncSession, obj_in: AlertCreate, org_id: Optional[Any] = None):
        if obj_in.case_id:
            case = await case_repo.get(db, obj_in.case_id, org_id=org_id)
            if not case:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
        db_obj = await self.repository.create(db, obj_in=obj_in, org_id=org_id)
        return await self.repository.get(db, db_obj.id, org_id=org_id)

    async def update_alert(self, db: AsyncSession, id: uuid.UUID, obj_in: AlertUpdate, org_id: Optional[Any] = None):
        db_obj = await self.repository.get(db, id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

        update_data = obj_in.dict(exclude_unset=True)
        if "case_id" in update_data and update_data["case_id"] is not None:
            case = await case_repo.get(db, update_data["case_id"], org_id=org_id)
            if not case:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete_alert(self, db: AsyncSession, id: uuid.UUID, org_id: Optional[Any] = None):
        db_obj = await self.repository.get(db, id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
        await db.delete(db_obj)
        await db.commit()

class InvestigationService(BaseService[InvestigationRepository]):
    async def get_by_alert_id(self, db: AsyncSession, alert_id: uuid.UUID, org_id: Optional[Any] = None):
        db_obj = await self.repository.get_by_alert_id(db, alert_id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
        return db_obj

    async def create_investigation(self, db: AsyncSession, obj_in: InvestigationCreate, org_id: Optional[Any] = None):
        alert = await alert_repo.get(db, obj_in.alert_id, org_id=org_id)
        if not alert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

        db_obj = await self.repository.create(db, obj_in=obj_in)
        return await self.repository.get(db, db_obj.id, org_id=org_id)

    async def update_investigation(self, db: AsyncSession, id: uuid.UUID, obj_in: InvestigationUpdate, org_id: Optional[Any] = None):
        db_obj = await self.repository.get(db, id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")

        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)

        # Sync status with linked aler
        if "status" in update_data and update_data["status"]:
            alert = await alert_repo.get(db, db_obj.alert_id, org_id=org_id)
            if alert:
                alert.status = update_data["status"]
                db.add(alert)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def escalate_investigation(self, db: AsyncSession, id: uuid.UUID, org_id: Optional[Any] = None):
        db_obj = await self.repository.get(db, id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Investigation not found")
        
        alert = await alert_repo.get(db, db_obj.alert_id, org_id=org_id)
        if not alert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated Alert not found")

        if alert.case_id:
            case = await case_repo.get(db, alert.case_id, org_id=org_id)
            if case:
                return await case_repo.get(db, case.id, org_id=org_id)
            
        from app.schemas.operations import CaseCreate
        new_case_schema = CaseCreate(
            title=f"Case: {alert.title}",
            severity=alert.severity,
            priority="High" if alert.severity.lower() in ["high", "critical"] else "Medium",
            risk_score=alert.risk_score,
            description=f"Escalated from Investigation INV-{str(id)[:8]}. Threat Type: {alert.threat_type}"
        )
        new_case_db = await case_repo.create(db, obj_in=new_case_schema, org_id=org_id)
        
        alert.case_id = new_case_db.id
        db.add(alert)
        
        db_obj.status = "Escalated"
        db.add(db_obj)
        
        await db.commit()
        return await case_repo.get(db, new_case_db.id, org_id=org_id)

    async def generate_overview_summary(self, db: AsyncSession, org_id: Optional[Any] = None) -> dict:
        from sqlalchemy import select
        from app.models.operations import Alert

        query = select(Alert)
        if org_id:
            query = query.filter(Alert.org_id == org_id)

        result = await db.execute(query)
        alerts = result.scalars().all()

        total = len(alerts)
        if total == 0:
            return {"summary": "There are currently no active investigations or alerts in the system."}

        critical_count = sum(1 for a in alerts if a.risk_score >= 90)
        resolved_count = sum(1 for a in alerts if a.status.lower() == 'resolved')
        pending_count = total - resolved_count

        threat_types = list(set([a.threat_type for a in alerts if a.threat_type]))
        threats_str = ", ".join(threat_types) if threat_types else "various threats"

        summary = (
            f"Chrona SOC is currently tracking {total} investigations. "
            f"There are {critical_count} critical threats requiring immediate attention, "
            f"and {pending_count} pending reviews. "
            f"Active threat vectors include {threats_str}. "
            f"So far, {resolved_count} investigations have been successfully resolved."
        )
        return {"summary": summary}

class CaseService(BaseService[CaseRepository]):
    async def create_case(self, db: AsyncSession, obj_in: CaseCreate, org_id: Optional[Any] = None):
        db_obj = await self.repository.create(db, obj_in=obj_in, org_id=org_id)
        return await self.repository.get(db, db_obj.id, org_id=org_id)

    async def update_case(self, db: AsyncSession, id: uuid.UUID, obj_in: CaseUpdate, org_id: Optional[Any] = None):
        db_obj = await self.repository.get(db, id, org_id=org_id)
        if not db_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

        update_data = obj_in.dict(exclude_unset=True)

        if "assignee" in update_data:
            assignee_name = update_data.pop("assignee")
            if assignee_name:
                from sqlalchemy import select
                from app.models.identity import User
                from fastapi import HTTPException
                if org_id:
                    user_res = await db.execute(select(User).filter(User.name == assignee_name, User.org_id == org_id))
                else:
                    user_res = await db.execute(select(User).filter(User.name == assignee_name))
                user = user_res.scalars().first()
                if user:
                    update_data["assignee_id"] = user.id
                else:
                    raise HTTPException(status_code=400, detail=f"User '{assignee_name}' not found")

        for field, value in update_data.items():
            setattr(db_obj, field, value)

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return await self.repository.get(db, db_obj.id, org_id=org_id)

class EvidenceService(BaseService[EvidenceRepository]):
    async def add_evidence(self, db: AsyncSession, case_id: uuid.UUID, obj_in: EvidenceCreate, org_id: Optional[Any] = None):
        # Verify case belongs to org
        case = await case_repo.get(db, case_id, org_id=org_id)
        if not case:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

        obj_in.case_id = case_id
        db_obj = await self.repository.create(db, obj_in=obj_in)
        return await self.repository.get(db, db_obj.id, org_id=org_id)

alert_service = AlertService(alert_repo)
investigation_service = InvestigationService(investigation_repo)
case_service = CaseService(case_repo)
evidence_service = EvidenceService(evidence_repo)
