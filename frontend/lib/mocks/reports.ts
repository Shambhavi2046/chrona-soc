import { ReportTemplate, GeneratedReport, ComplianceFramework } from "@/types";

export const mockTemplates: ReportTemplate[] = [
  { id: "TPL-01", name: "Executive Summary", description: "High-level overview of security posture and critical incidents.", estimated_pages: 3, lastUpdated: "2023-10-15", category: "Executive" },
  { id: "TPL-02", name: "Incident Report", description: "Detailed timeline and IOC mapping for a specific investigation.", estimated_pages: 12, lastUpdated: "2023-10-20", category: "Operational" },
  { id: "TPL-03", name: "MITRE ATT&CK Coverage", description: "Current detection capabilities mapped against MITRE tactics.", estimated_pages: 8, lastUpdated: "2023-10-22", category: "Operational" },
  { id: "TPL-04", name: "SOC 2 Audit Prep", description: "Evidence mapping for SOC 2 Type II compliance controls.", estimated_pages: 45, lastUpdated: "2023-10-01", category: "Compliance" },
  { id: "TPL-05", name: "Threat Hunting Summary", description: "Results from proactive threat hunting campaigns and queries.", estimated_pages: 6, lastUpdated: "2023-10-18", category: "Operational" },
];

export const mockReports: GeneratedReport[] = [
  { id: "REP-9921", name: "Weekly Executive Briefing - W42", type: "Executive Summary", generated_by: "System", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), pages: 4, status: "Ready", updated_at: new Date().toISOString() },
  { id: "REP-9922", name: "Incident Report: CASE-409", type: "Incident Report", generated_by: "Alice Smith", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), pages: 14, status: "Ready", updated_at: new Date().toISOString() },
  { id: "REP-9923", name: "NIST CSF Gap Analysis", type: "Compliance", generated_by: "Bob Jones", created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), pages: 0, status: "Generating", updated_at: new Date().toISOString() },
  { id: "REP-9924", name: "Monthly IOC Sweep", type: "Threat Hunting", generated_by: "System", created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), pages: 28, status: "Ready", updated_at: new Date().toISOString() },
];

export const mockFrameworks: ComplianceFramework[] = [
  { id: "FW-01", name: "MITRE ATT&CK", coverage: 82, mappedControls: 215, findings: 14, status: "Warning" },
  { id: "FW-02", name: "NIST CSF", coverage: 94, mappedControls: 98, findings: 2, status: "Pass" },
  { id: "FW-03", name: "ISO 27001", coverage: 88, mappedControls: 114, findings: 5, status: "Warning" },
  { id: "FW-04", name: "SOC 2 Type II", coverage: 96, mappedControls: 64, findings: 0, status: "Pass" },
  { id: "FW-05", name: "CIS Controls v8", coverage: 71, mappedControls: 153, findings: 28, status: "Fail" },
];
