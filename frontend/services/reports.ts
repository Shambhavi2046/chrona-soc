import { fetchApi } from "./api";
import { API_URL } from './config';
import { GeneratedReport, ReportTemplate } from '@/types/reports';
import { mapToUuid } from '@/utils/idMapping';

export const getReports = async (): Promise<GeneratedReport[]> => {
  const response = await fetchApi(`/reports/`);
  if (!response.ok) {
    throw new Error('Failed to fetch reports');
  }
  return response.json();
};

export const getTemplates = async (): Promise<ReportTemplate[]> => {
  const response = await fetchApi(`${API_URL}/reports/templates`);
  if (!response.ok) throw new Error("Failed to fetch templates");
  return response.json();
};

export const createTemplate = async (data: Partial<ReportTemplate>): Promise<ReportTemplate> => {
  const response = await fetchApi(`${API_URL}/reports/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create template");
  return response.json();
};

export const exportAllReportsZip = async (): Promise<void> => {
  const response = await fetchApi(`${API_URL}/reports/export/zip`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to download zip');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `all_reports.zip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const generateReport = async (payload: { name: string, source_type: string, source_id: string, template_id: string }): Promise<GeneratedReport> => {
  const response = await fetchApi(`${API_URL}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to generate report');
  }
  return response.json();
};

export const deleteReport = async (id: string): Promise<void> => {
  const uuid = mapToUuid(id);
  const response = await fetchApi(`${API_URL}/reports/${uuid}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete report');
  }
};

export const downloadReportJson = async (id: string): Promise<void> => {
  const response = await fetchApi(`${API_URL}/reports/${id}/export/json`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to download JSON report');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report_${id}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const downloadReportPdf = async (id: string): Promise<void> => {
  const response = await fetchApi(`${API_URL}/reports/${id}/export/pdf`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to download PDF report');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
