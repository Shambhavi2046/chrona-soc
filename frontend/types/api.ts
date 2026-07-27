export interface Alert {
  id: string;
  log_id?: string;
  title?: string;
  severity?: string;
  threat_type: string;
  risk_score: number;
  status: string;
  created_at: string;
  mitre_tactic?: string;
  mitre_technique?: string;
}

export interface InvestigationResponse {
  id?: string;
  alert_id: string;
  threat_type: string;
  risk_score: number;
  status: string;
  investigation: {
    analysis: string;
    recommendations: string[];
  };
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

export interface Case {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  alert_id: string | null;
  risk_score: number;
  created_at: string;
  updated_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  business_impact: string;
}

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  case_id: string;
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
  related_cases: Array<{ id: string; title: string; status: string }>;
  affected_assets: string[];
  mitre_tactics: string[];
  linked_alerts: Array<{ id: string | null; threat_type: string; risk_score: number }>;
  threat_context: ThreatContext | null;
  risk_assessment: RiskAssessment | null;
  collaboration: Collaboration | null;
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
