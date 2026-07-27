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

    async def generate_report_from_source(self, db: AsyncSession, request: ReportGenerateRequest):
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
            if request.source_type.lower() == "alert":
                alert = await alert_service.get_by_id(db, request.source_id)
                if alert:
                    content_kwargs["incident_overview"] = f"Alert '{alert.title}' (Severity: {alert.severity}) triggered at {alert.created_at}."
                    content_kwargs["affected_assets"] = [alert.asset] if alert.asset else []
                    if alert.mitre_tactic or alert.mitre_technique:
                        content_kwargs["mitre_mapping"] = [f"{alert.mitre_tactic or ''} - {alert.mitre_technique or ''}"]
            elif request.source_type.lower() == "investigation":
                investigation = await investigation_service.get_by_id(db, request.source_id)
                if investigation:
                    content_kwargs["incident_overview"] = f"Investigation initiated for alert {investigation.alert_id}."
                    content_kwargs["analyst_findings"] = str(investigation.findings) if investigation.findings else ""
                    content_kwargs["executive_summary"] = investigation.summary or content_kwargs["executive_summary"]
            elif request.source_type.lower() == "case":
                case = await case_service.get_by_id(db, request.source_id)
                if case:
                    content_kwargs["incident_overview"] = f"Case '{case.title}' (Priority: {case.priority}) currently {case.status}."
                    content_kwargs["executive_summary"] = case.description or content_kwargs["executive_summary"]
                    if getattr(case, 'timeline', None):
                        content_kwargs["timeline"] = [{"time": str(t.created_at), "event": t.content} for t in case.timeline]
                    if getattr(case, 'evidence', None):
                        content_kwargs["indicators_of_compromise"] = [{"type": e.type, "value": e.value} for e in case.evidence]
            elif request.source_type.lower() == "threat hunt":
                hunt = await hunting_service.get_by_id(db, request.source_id)
                if hunt:
                    content_kwargs["incident_overview"] = f"Threat Hunt '{hunt.name}' with query: {hunt.query}."
                    content_kwargs["analyst_findings"] = f"Matches found based on {hunt.type} execution."
        except Exception as e:
            # Fallback in case of fetching error, don't crash
            print(f"Error fetching source data for report: {e}")
        
        content = ReportContentSchema(**content_kwargs)

        obj_in = ReportCreate(
            name=request.name,
            type=request.source_type,
            source_id=request.source_id,
            template_id=request.template_id,
            generated_by=request.generated_by,
            status="Ready",
            pages=3,
            content=content
        )

        db_obj = await self.repository.create(db, obj_in=obj_in)
        return await self.repository.get(db, db_obj.id)

    async def get_pdf_bytes(self, db: AsyncSession, report_id: uuid.UUID) -> bytes:
        report = await self.repository.get(db, report_id)
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
