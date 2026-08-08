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

            from sqlalchemy.orm.attributes import flag_modified
            if 'definition' in update_data:
                flag_modified(db_obj, "definition")

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

    async def execute_playbook(self, db: AsyncSession, playbook_id: uuid.UUID, background_tasks, user: str = "System") -> dict:
        from app.models.automation import PlaybookExecution
        from datetime import datetime
        
        playbook = await self.get_by_id(db, playbook_id)
        if not playbook:
            raise HTTPException(status_code=404, detail="Playbook not found")
            
        execution_id = uuid.uuid4()
        start_time = datetime.utcnow()
        
        execution = PlaybookExecution(
            id=execution_id,
            playbook_id=playbook.id,
            status="Running",
            started_at=start_time.isoformat() + "Z",
            execution_logs=[],
            initiated_by=user
        )
        db.add(execution)
        await db.commit()
        await db.refresh(execution)
        
        background_tasks.add_task(self._run_execution_background, execution_id, playbook.id, user)

        resp = execution.__dict__.copy()
        resp['playbookName'] = playbook.name
        resp['trigger'] = playbook.trigger_type
        
        return resp

    async def _run_execution_background(self, execution_id: uuid.UUID, playbook_id: uuid.UUID, user: str):
        from app.db.session import async_session_maker
        from app.models.automation import PlaybookExecution
        from datetime import datetime
        from app.services.soar.context import ExecutionContext
        from app.services.soar.engine import ExecutionEngine
        import asyncio

        async with async_session_maker() as db:
            playbook = await self.get_by_id(db, playbook_id)
            if not playbook:
                return

            context = ExecutionContext(execution_id=str(execution_id), playbook_id=str(playbook.id), initiated_by=user)
            definition = playbook.definition or {}
            actions = definition.get("actions") or definition.get("nodes") or []

            engine = ExecutionEngine(context=context, actions=actions)

            # Run execution asynchronously
            final_status = await engine.execute_all(db, execution_id)

            exec_obj = await db.get(PlaybookExecution, execution_id)
            if exec_obj:
                end_time = datetime.utcnow()
                start_time = datetime.fromisoformat(exec_obj.started_at.replace('Z', ''))
                duration = f"{(end_time - start_time).total_seconds():.2f}s"

                exec_obj.status = final_status
                exec_obj.completed_at = end_time.isoformat() + "Z"
                exec_obj.duration = duration
                db.add(exec_obj)
                await db.commit()

    async def cancel_execution(self, db: AsyncSession, id: uuid.UUID) -> dict:
        from app.models.automation import PlaybookExecution
        exec_obj = await db.get(PlaybookExecution, id)
        if not exec_obj:
            raise HTTPException(status_code=404, detail="Execution not found")
        if exec_obj.status not in ["Running", "Paused", "Pending"]:
            raise HTTPException(status_code=400, detail="Execution is already completed")
        exec_obj.status = "Cancelled"
        db.add(exec_obj)
        await db.commit()
        await db.refresh(exec_obj)
        return exec_obj.__dict__

    async def pause_execution(self, db: AsyncSession, id: uuid.UUID) -> dict:
        from app.models.automation import PlaybookExecution
        exec_obj = await db.get(PlaybookExecution, id)
        if not exec_obj:
            raise HTTPException(status_code=404, detail="Execution not found")
        if exec_obj.status != "Running":
            raise HTTPException(status_code=400, detail="Only running executions can be paused")
        exec_obj.status = "Paused"
        db.add(exec_obj)
        await db.commit()
        await db.refresh(exec_obj)
        return exec_obj.__dict__

    async def resume_execution(self, db: AsyncSession, id: uuid.UUID) -> dict:
        from app.models.automation import PlaybookExecution
        exec_obj = await db.get(PlaybookExecution, id)
        if not exec_obj:
            raise HTTPException(status_code=404, detail="Execution not found")
        if exec_obj.status != "Paused":
            raise HTTPException(status_code=400, detail="Only paused executions can be resumed")
        exec_obj.status = "Running"
        db.add(exec_obj)
        await db.commit()
        await db.refresh(exec_obj)
        return exec_obj.__dict__

    async def get_execution_by_id(self, db: AsyncSession, id: uuid.UUID) -> dict:
        from app.models.automation import PlaybookExecution
        from sqlalchemy.orm import selectinload
        query = select(PlaybookExecution).options(selectinload(PlaybookExecution.playbook)).where(PlaybookExecution.id == id)
        result = await db.execute(query)
        ex = result.scalar_one_or_none()
        if not ex:
            raise HTTPException(status_code=404, detail="Execution not found")

        d = ex.__dict__.copy()
        if ex.playbook:
            d['playbookName'] = ex.playbook.name
            d['trigger'] = ex.playbook.trigger_type
        else:
            d['playbookName'] = "Unknown"
            d['trigger'] = "Unknown"
        return d

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
