import { API_URL } from './config';
import { GeneratedReport, ReportTemplate } from '@/types/reports';
import { mapToUuid } from '@/utils/idMapping';

export const getReports = async (): Promise<GeneratedReport[]> => {
  const response = await fetch(`${API_URL}/reports/`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
};

export const getTemplates = async (): Promise<ReportTemplate[]> => {
  const response = await fetch(`${API_URL}/reports/templates`);
  if (!response.ok) {
    throw new Error('Failed to fetch report templates');
  }
  return response.json();
};

export const generateReport = async (payload: { name: string, source_type: string, source_id: string, template_id: string }): Promise<GeneratedReport> => {
  const response = await fetch(`${API_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  return response.json();
};

export const deleteReport = async (id: string): Promise<void> => {
  const uuid = mapToUuid(id);
  const response = await fetch(`${API_URL}/reports/${uuid}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete report');
  }
};

export const downloadReportJson = (id: string) => {
  window.open(`${API_URL}/reports/${id}/export/json`, '_blank');
};

export const downloadReportPdf = (id: string) => {
  window.open(`${API_URL}/reports/${id}/export/pdf`, '_blank');
};
