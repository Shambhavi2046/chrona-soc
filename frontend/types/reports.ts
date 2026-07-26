export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  estimatedPages: number;
  lastUpdated: string;
  category: "Executive" | "Operational" | "Compliance";
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedBy: string;
  generatedTime: string;
  pages: number;
  status: "Ready" | "Generating" | "Failed";
}

export interface ComplianceFramework {
  id: string;
  name: string;
  coverage: number;
  mappedControls: number;
  findings: number;
  status: "Pass" | "Warning" | "Fail";
}
