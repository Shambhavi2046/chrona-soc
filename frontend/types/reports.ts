export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  estimated_pages: number;
  lastUpdated: string;
  category: string;
}

export interface ReportContent {
  executive_summary: string;
  incident_overview: string;
  timeline: { time: string; event: string }[];
  affected_assets: string[];
  mitre_mapping: string[];
  indicators_of_compromise: { type: string; value: string }[];
  analyst_findings: string;
  recommendations: string;
  appendix: string;
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  source_id?: string;
  template_id?: string;
  generated_by: string;
  status: "Ready" | "Generating" | "Failed";
  pages: number;
  content?: ReportContent;
  created_at: string;
  updated_at: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  coverage: number;
  mappedControls: number;
  findings: number;
  status: "Pass" | "Warning" | "Fail";
}
