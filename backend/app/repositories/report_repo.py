from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.repositories.base import BaseRepository
from app.models.report_model import Report, ReportTemplate

class ReportRepository(BaseRepository[Report]):
    def __init__(self):
        super().__init__(Report)

class ReportTemplateRepository(BaseRepository[ReportTemplate]):
    def __init__(self):
        super().__init__(ReportTemplate)

report_repo = ReportRepository()
report_template_repo = ReportTemplateRepository()
