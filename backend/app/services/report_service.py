import io
import uuid
import json
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.report_repo import report_repo, report_template_repo
from app.schemas.report_schema import ReportCreate, ReportContentSchema, ReportGenerateRequest
from app.services.base import BaseService
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER

class ReportService(BaseService):
    def __init__(self):
        super().__init__(report_repo)
        self.template_repo = report_template_repo

    async def generate_report_from_source(self, db: AsyncSession, request: ReportGenerateRequest, org_id: uuid.UUID):
        from app.services.operations import alert_service, investigation_service, case_service
        from app.services.hunting_service import hunting_service

        # Default empty content
        content_kwargs = {
            "executive_summary": f"Automated {request.source_type} report generated.",
            "incident_overview": f"No details available for {request.source_id}.",
            "timeline": [],
            "affected_assets": [],
            "mitre_mapping": [],
            "indicators_of_compromise": [],
            "analyst_findings": "",
            "recommendations": "Review system logs for more details.",
            "appendix": ""
        }

        try:
            source_uuid = uuid.UUID(request.source_id)
        except ValueError:
            raise ValueError("Invalid source identifier")

        if request.source_type.lower() == "alert":
            alert = await alert_service.get_by_id(db, source_uuid, org_id=org_id)
            if not alert:
                raise ValueError("Source entity not found")
            content_kwargs["incident_overview"] = f"Alert '{alert.title}' (Severity: {alert.severity}) triggered at {alert.created_at}."
            asset_val = getattr(alert, "source", None)
            content_kwargs["affected_assets"] = [asset_val] if asset_val else []
            tactic = getattr(alert, "mitre_tactic", None)
            tech = getattr(alert, "mitre_technique", None)
            if tactic or tech:
                content_kwargs["mitre_mapping"] = [f"{tactic or ''} - {tech or ''}"]
        elif request.source_type.lower() == "investigation":
            investigation = await investigation_service.get_by_id(db, source_uuid, org_id=org_id)
            if not investigation:
                raise ValueError("Source entity not found")
            content_kwargs["incident_overview"] = f"Investigation initiated for alert {investigation.alert_id}."
            content_kwargs["analyst_findings"] = str(investigation.findings) if investigation.findings else ""
            content_kwargs["executive_summary"] = investigation.summary or content_kwargs["executive_summary"]
        elif request.source_type.lower() == "case":
            case = await case_service.get_by_id(db, source_uuid, org_id=org_id)
            if not case:
                raise ValueError("Source entity not found")
            content_kwargs["incident_overview"] = f"Case '{case.title}' (Priority: {case.priority}) currently {case.status}."
            content_kwargs["executive_summary"] = case.description or content_kwargs["executive_summary"]
            if getattr(case, 'timeline', None):
                content_kwargs["timeline"] = [{"time": str(t.created_at), "event": t.content} for t in case.timeline]
            if getattr(case, 'evidence', None):
                content_kwargs["indicators_of_compromise"] = [{"type": e.type, "value": e.value} for e in case.evidence]
        elif request.source_type.lower() == "threat hunt":
            from sqlalchemy import select
            from app.models.hunting_model import SavedHunt
            result = await db.execute(select(SavedHunt).filter_by(id=source_uuid, org_id=org_id))
            hunt = result.scalar_one_or_none()
            if not hunt:
                raise ValueError("Source entity not found")
            content_kwargs["incident_overview"] = f"Threat Hunt '{hunt.name}' with query: {hunt.query}."
            content_kwargs["analyst_findings"] = f"Matches found based on Threat Hunt execution."
        else:
            raise ValueError("Unsupported source_type")

        content = ReportContentSchema(**content_kwargs)

        obj_in_data = {
            "name": request.name,
            "type": request.source_type,
            "source_id": request.source_id,
            "template_id": request.template_id,
            "generated_by": request.generated_by,
            "status": "Ready",
            "pages": 3,
            "content": content.model_dump(),
            "org_id": org_id
        }

        db_obj = self.repository.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_pdf_bytes(self, db: AsyncSession, report_id: uuid.UUID, org_id: uuid.UUID) -> bytes:
        from sqlalchemy import select
        result = await db.execute(select(self.repository.model).filter_by(id=report_id, org_id=org_id))
        report = result.scalar_one_or_none()
        if not report:
            raise ValueError("Report not found")

        content = report.content or {}

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        styles = getSampleStyleSheet()

        title_style = styles['Heading1']
        title_style.alignment = TA_CENTER

        h2 = styles['Heading2']
        body = styles['BodyText']

        Story = []

        Story.append(Paragraph(f"Chrona SOC - {report.name}", title_style))
        Story.append(Spacer(1, 12))

        Story.append(Paragraph(f"Type: {report.type}", body))
        Story.append(Paragraph(f"Generated By: {report.generated_by}", body))
        Story.append(Spacer(1, 12))

        sections = [
            ("Executive Summary", content.get("executive_summary", "")),
            ("Incident Overview", content.get("incident_overview", "")),
            ("Analyst Findings", content.get("analyst_findings", "")),
            ("Recommendations", content.get("recommendations", "")),
            ("Appendix", content.get("appendix", ""))
        ]

        for heading, text in sections:
            Story.append(Paragraph(heading, h2))
            Story.append(Paragraph(str(text), body))
            Story.append(Spacer(1, 12))

        doc.build(Story)
        pdf_value = buffer.getvalue()
        buffer.close()
        return pdf_value

report_service = ReportService()
