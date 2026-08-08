from typing import List, Dict, Any
from datetime import datetime
from app.services.soar.context import ExecutionContext
from app.services.soar.actions import ACTION_REGISTRY

import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
import copy
import uuid

class ExecutionEngine:
    def __init__(self, context: ExecutionContext, actions: List[Dict[str, Any]]):
        self.context = context
        self.actions = actions
        self.execution_logs: List[Dict[str, Any]] = []

    async def _update_db_logs(self, db: AsyncSession, execution_id: uuid.UUID):
        from app.models.automation import PlaybookExecution
        from sqlalchemy.orm.attributes import flag_modified
        exec_obj = await db.get(PlaybookExecution, execution_id)
        if exec_obj:
            exec_obj.execution_logs = copy.deepcopy(self.execution_logs)
            flag_modified(exec_obj, "execution_logs")
            db.add(exec_obj)
            await db.commit()

    async def execute_all(self, db: AsyncSession, execution_id: uuid.UUID) -> str:
        """Executes all actions asynchronously and handles pause/cancel/retry."""
        from app.models.automation import PlaybookExecution

        self.execution_logs.append({
            "step": "Initializing Execution Engine",
            "status": "Success",
            "time": datetime.utcnow().isoformat() + "Z"
        })
        await self._update_db_logs(db, execution_id)

        for index, action_node in enumerate(self.actions):
            # Check pause/cancel before action
            while True:
                exec_obj = await db.get(PlaybookExecution, execution_id)
                if not exec_obj:
                    return "Failed"

                await db.refresh(exec_obj)

                if exec_obj.status == "Cancelled":
                    self.execution_logs.append({
                        "step": "Workflow Cancellation",
                        "status": "Failed",
                        "time": datetime.utcnow().isoformat() + "Z",
                        "message": "Execution was cancelled by user."
                    })
                    await self._update_db_logs(db, execution_id)
                    return "Cancelled"
                if exec_obj.status == "Paused":
                    await asyncio.sleep(1)
                    continue
                break

            action_type = action_node.get("type")
            config = action_node.get("config", {})
            max_retries = int(config.get("retries", 0))

            step_title = f"Action {index + 1}: {action_type}"

            if not action_type:
                self.execution_logs.append({
                    "step": step_title,
                    "status": "Failed",
                    "time": datetime.utcnow().isoformat() + "Z",
                    "message": "Action type missing"
                })
                await self._update_db_logs(db, execution_id)
                return "Failed"

            handler = ACTION_REGISTRY.get(action_type)
            if not handler:
                self.execution_logs.append({
                    "step": step_title,
                    "status": "Failed",
                    "time": datetime.utcnow().isoformat() + "Z",
                    "message": f"Unsupported action type: '{action_type}'"
                })
                await self._update_db_logs(db, execution_id)
                return "Failed"

            # Execute with retries
            attempt = 0
            while attempt <= max_retries:
                attempt += 1
                try:
                    result = await asyncio.to_thread(handler.execute, self.context, config)
                except Exception as e:
                    result = {
                        "status": "failed",
                        "output": {},
                        "message": f"Unhandled exception: {str(e)}",
                        "error": str(e)
                    }

                # Log the attempt
                attempt_title = step_title if max_retries == 0 else f"{step_title} (Attempt {attempt})"
                log_entry = {
                    "step": attempt_title,
                    "status": "Success" if result.get("status") == "success" else "Failed",
                    "time": datetime.utcnow().isoformat() + "Z",
                    "message": result.get("message", "No message provided"),
                    "output": result.get("output", {})
                }
                if "error" in result:
                    log_entry["error"] = result["error"]

                self.execution_logs.append(log_entry)
                await self._update_db_logs(db, execution_id)

                if result.get("status") == "success":
                    break
                else:
                    if attempt <= max_retries:
                        # Wait a bit before retry (e.g. 1 second)
                        await asyncio.sleep(1)
                    else:
                        return "Failed"

        self.execution_logs.append({
            "step": "Workflow Complete",
            "status": "Success",
            "time": datetime.utcnow().isoformat() + "Z"
        })
        await self._update_db_logs(db, execution_id)

        return "Success"
