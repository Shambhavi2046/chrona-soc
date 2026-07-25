const API_URL = typeof window !== 'undefined' ? '/api/v1' : 'http://127.0.0.1:8000/api/v1';

export interface Alert {
  id: number;
  log_id: number;
  threat_type: string;
  risk_score: number;
  status: string;
  created_at: string;
}

export async function getDashboardStats() {
  const response = await fetch(
    `${API_URL}/dashboard`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(
    `${API_URL}/alerts`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch alerts data");
  }

  return response.json();
}

export interface InvestigationResponse {
  alert_id: number;
  threat_type: string;
  risk_score: number;
  status: string;
  investigation: {
    analysis: string;
    recommendations: string[];
  };
}

export async function getInvestigation(alertId: string | number): Promise<InvestigationResponse> {
  const response = await fetch(
    `${API_URL}/alerts/${alertId}/investigate`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch investigation data");
  }

  return response.json();
}

export interface AnalyticsResponse {
  kpis: {
    totalIncidents: number;
    activeIncidents: number;
    criticalIncidents: number;
    highSeverityAlerts: number;
    openInvestigations: number;
    activeThreats: number;
    highRiskAssets: number;
    securityScore: number;
    overallRiskScore: number;
    threatIntelMatches: number;
    mttd: string;
    mttr: string;
  };
  attackTrends: Array<{ timestamp: string; count: number }>;
  threatSeverity: Array<{ severity: string; count: number }>;
  mitreAnalytics: {
    topTactics: Array<{ tactic: string; count: number }>;
  };
  assetRisk: Array<{ asset: string; riskScore: number; incidents: number }>;
  geographicAnalytics: Array<{ country: string; count: number }>;
  alertAnalytics: {
    open: number;
    closed: number;
    falsePositive: number;
    suppressed: number;
  };
  aiInsights: string[];
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const response = await fetch(`${API_URL}/analytics`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }
  return response.json();
}

export interface Case {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  alert_id: number | null;
  risk_score: number;
  created_at: string;
  updated_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  business_impact: string;
}

export interface TimelineEvent {
  id: number;
  case_id: number;
  event_type: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Evidence {
  id: number;
  case_id: number;
  evidence_type: string;
  value: string;
  description: string;
  added_by: string;
  created_at: string;
  source: string;
  confidence: string;
}

export interface AIRecommendation {
  action: string;
  priority: string;
  confidence: number;
  impact: string;
  status: string;
}

export interface ThreatContext {
  actor: string;
  malware_family: string;
  ioc_count: number;
  reputation: string;
  feed_source: string;
  cves: string[];
}

export interface RiskAssessment {
  overall_risk: string;
  likelihood: string;
  asset_exposure: string;
  threat_confidence: string;
  attack_complexity: string;
}

export interface Collaboration {
  notes: TimelineEvent[];
  decision_log: TimelineEvent[];
}

export interface CaseDetail extends Case {
  timeline: TimelineEvent[];
  evidence: Evidence[];
  ai_recommendations: AIRecommendation[];
  ai_summary: string;
  sla_status: string;
  related_cases: Array<{ id: number; title: string; status: string }>;
  affected_assets: string[];
  mitre_tactics: string[];
  linked_alerts: Array<{ id: number | null; threat_type: string; risk_score: number }>;
  threat_context: ThreatContext | null;
  risk_assessment: RiskAssessment | null;
  collaboration: Collaboration | null;
}

export async function getCases(): Promise<Case[]> {
  const response = await fetch(`${API_URL}/cases`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch cases");
  return response.json();
}

export async function getCaseById(caseId: number | string): Promise<CaseDetail> {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch case detail");
  return response.json();
}

export async function updateCaseStatus(caseId: number | string, status: string, assignee?: string): Promise<Case> {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, assignee }),
  });
  if (!response.ok) throw new Error("Failed to update case");
  return response.json();
}

export async function addCaseComment(caseId: number | string, content: string): Promise<TimelineEvent> {
  const response = await fetch(`${API_URL}/cases/${caseId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return response.json();
}

export async function addCaseEvidence(caseId: number | string, evidence_type: string, value: string): Promise<Evidence> {
  const response = await fetch(`${API_URL}/cases/${caseId}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence_type, value }),
  });
  if (!response.ok) throw new Error("Failed to add evidence");
  return response.json();
}

export interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface GraphTopology {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function getGraphTopology(): Promise<GraphTopology> {
  const response = await fetch(`${API_URL}/graph`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Failed to fetch graph topology");
  return response.json();
}

export interface CopilotQuickAction {
  label: string;
  url: string;
  action_type: string;
}

export interface CopilotActiveContext {
  id: string;
  title: string;
  status: string;
  priority: string;
  risk_score: number;
  asset_count: number;
  type: string;
}

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CopilotResponse {
  response: string;
  suggested_prompts: string[];
  quick_actions: CopilotQuickAction[];
  active_context?: CopilotActiveContext | null;
}

export async function sendCopilotMessage(prompt: string, history: CopilotMessage[]): Promise<CopilotResponse> {
  const response = await fetch(`${API_URL}/copilot/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, history }),
  });
  if (!response.ok) throw new Error("Failed to send copilot message");
  return response.json();
}