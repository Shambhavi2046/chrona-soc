from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
from app.db.session import get_db
from app.services.report_service import report_service
from app.schemas.report_schema import ReportSchema, ReportGenerateRequest, ReportTemplateSchema
from app.utils.validation import get_pagination, PaginationParams
import json

router = APIRouter()

@router.get("/", response_model=List[ReportSchema])
async def list_reports(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    return await report_service.repository.get_all(db, skip=pagination.skip, limit=pagination.limit)

@router.get("/templates", response_model=List[ReportTemplateSchema])
async def list_templates(
    db: AsyncSession = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination)
):
    return await report_service.template_repo.get_all(db, skip=pagination.skip, limit=pagination.limit)

@router.post("/generate", response_model=ReportSchema)
async def generate_report(
    request: ReportGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    return await report_service.generate_report_from_source(db, request)

@router.delete("/{id}")
async def delete_report(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    report = await report_service.repository.get(db, id=id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    await db.delete(report)
    await db.commit()
    return {"status": "success"}

@router.get("/{id}/export/json")
async def export_report_json(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    report = await report_service.repository.get(db, id=id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # We must format it for standard JSON download
    data = {
        "id": str(report.id),
        "name": report.name,
        "type": report.type,
        "generated_by": report.generated_by,
        "content": report.content
    }
    
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=report_{report.id}.json"}
    )

@router.get("/{id}/export/pdf")
async def export_report_pdf(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    try:
        pdf_bytes = await report_service.get_pdf_bytes(db, id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=report_{id}.pdf"}
    )
