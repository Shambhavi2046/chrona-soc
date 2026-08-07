from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import exc
import uuid
from fastapi import HTTPException

from app.models.automation import Playbook
from app.schemas.soar import PlaybookCreate, PlaybookUpdate

class SOARService:
    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[Playbook]:
        query = select(Playbook).order_by(Playbook.created_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def get_by_id(self, db: AsyncSession, id: uuid.UUID) -> Optional[Playbook]:
        query = select(Playbook).where(Playbook.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: PlaybookCreate) -> Playbook:
        try:
            db_obj = Playbook(
                name=obj_in.name,
                description=obj_in.description,
                category=obj_in.category,
                trigger_type=obj_in.trigger_type,
                status=obj_in.status,
                definition=obj_in.workflow_definition,
                created_by="System"
            )
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except exc.IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=400, detail="Playbook with this name already exists")

    async def update(self, db: AsyncSession, id: uuid.UUID, obj_in: PlaybookUpdate) -> Playbook:
        db_obj = await self.get_by_id(db, id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Playbook not found")

        update_data = obj_in.model_dump(exclude_unset=True)
        if 'workflow_definition' in update_data:
            update_data['definition'] = update_data.pop('workflow_definition')

        try:
            for field, value in update_data.items():
                setattr(db_obj, field, value)

            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except exc.IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=400, detail="Playbook name conflict")

    async def delete(self, db: AsyncSession, id: uuid.UUID) -> None:
        db_obj = await self.get_by_id(db, id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Playbook not found")
        await db.delete(db_obj)
        await db.commit()

    async def activate(self, db: AsyncSession, id: uuid.UUID) -> Playbook:
        db_obj = await self.get_by_id(db, id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Playbook not found")
        db_obj.status = "Active"
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def deactivate(self, db: AsyncSession, id: uuid.UUID) -> Playbook:
        db_obj = await self.get_by_id(db, id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Playbook not found")
        db_obj.status = "Disabled"
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def execute_playbook(self, db: AsyncSession, playbook_id: uuid.UUID, user: str = "System") -> dict:
        from app.models.automation import PlaybookExecution
        from datetime import datetime
        from app.services.soar.context import ExecutionContext
        from app.services.soar.engine import ExecutionEngine
        
        playbook = await self.get_by_id(db, playbook_id)
        if not playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
            
        execution_id = uuid.uuid4()
        start_time = datetime.utcnow()
        
        # Setup context and engine
        context = ExecutionContext(execution_id=str(execution_id), playbook_id=str(playbook.id), initiated_by=user)
        
        # Extract actions from playbook definition.
        # Fallback to 'nodes' if 'actions' is not present, otherwise use empty list.
        definition = playbook.definition or {}
        actions = definition.get("actions") or definition.get("nodes") or []
        
        engine = ExecutionEngine(context=context, actions=actions)
        
        # Run execution
        final_status = engine.execute_all()
        
        end_time = datetime.utcnow()
        duration = f"{(end_time - start_time).total_seconds():.2f}s"
        
        execution = PlaybookExecution(
            id=execution_id,
            playbook_id=playbook.id,
            status=final_status,
            started_at=start_time.isoformat() + "Z",
            completed_at=end_time.isoformat() + "Z",
            duration=duration,
            execution_logs=engine.execution_logs,
            initiated_by=user
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)
        
        resp = execution.__dict__.copy()
        resp['playbookName'] = playbook.name
        resp['trigger'] = playbook.trigger_type
        
        return resp

    async def get_executions(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[dict]:
        from app.models.automation import PlaybookExecution
        from sqlalchemy.orm import selectinload
        
        query = select(PlaybookExecution).options(selectinload(PlaybookExecution.playbook)).order_by(PlaybookExecution.started_at.desc()).offset(skip).limit(limit)
        result = await db.execute(query)
        executions = result.scalars().all()
        
        resp = []
        for ex in executions:
            d = ex.__dict__.copy()
            if ex.playbook:
                d['playbookName'] = ex.playbook.name
                d['trigger'] = ex.playbook.trigger_type
            else:
                d['playbookName'] = "Unknown"
                d['trigger'] = "Unknown"
            resp.append(d)
            
        return resp

soar_service = SOARService()
