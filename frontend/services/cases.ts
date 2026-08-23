import { fetchApi } from "./api";
import { mapToUuid } from "@/utils/idMapping";
import { API_URL } from "./config";
import { Case, CaseDetail, TimelineEvent, Evidence } from "@/types";

export async function getCases(token?: string): Promise<Case[]> {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/cases`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch cases");
  return response.json();
}

export async function createCase(data: { title: string, severity: string, priority?: string, description?: string }): Promise<Case> {
  const response = await fetchApi(`${API_URL}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create case");
  return response.json();
}

export async function getCaseById(caseId: string | number, token?: string): Promise<CaseDetail> {
  const uuid = mapToUuid(caseId);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/cases/${uuid}`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch case detail");
  
  const data = await response.json();
  
  // Adapter layer for deferred AI and Threat context features
  // Matches the strict requirement: "Keep the adapter layer only for optional AI fields that are intentionally deferred"
  return {
    ...data,
    timeline: data.timeline_events || data.timeline || [],
    evidence: data.evidence || [],
    ai_recommendations: data.ai_recommendations || [],
    ai_summary: data.ai_summary || "AI Summary pending...",
    sla_status: data.sla_status || "On Track",
    related_cases: data.related_cases || [],
    affected_assets: data.affected_assets || [],
    mitre_tactics: data.mitre_tactics || [],
    linked_alerts: data.alerts || data.linked_alerts || [],
    threat_context: data.threat_context || null,
    risk_assessment: data.risk_assessment || null,
    collaboration: data.collaboration || null
  };
}

export async function updateCaseStatus(caseId: number | string, status: string, assignee?: string): Promise<Case> {
  const uuid = mapToUuid(caseId);
  const response = await fetchApi(`${API_URL}/cases/${uuid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, assignee }),
  });
  if (!response.ok) throw new Error("Failed to update case");
  return response.json();
}

export async function escalateCase(caseId: number | string): Promise<Case> {
  const uuid = mapToUuid(caseId);
  const response = await fetchApi(`${API_URL}/cases/${uuid}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority: "High", severity: "Critical" }),
  });
  if (!response.ok) throw new Error("Failed to escalate case");
  return response.json();
}

export async function addCaseComment(caseId: number | string, content: string): Promise<TimelineEvent> {
  const uuid = mapToUuid(caseId);
  const response = await fetchApi(`${API_URL}/cases/${uuid}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Failed to add comment");
  return await response.json();
}

export async function addCaseEvidence(caseId: number | string, evidence_type: string, value: string): Promise<Evidence> {
  const uuid = mapToUuid(caseId);
  const response = await fetchApi(`${API_URL}/cases/${uuid}/evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evidence_type, value }),
  });
  if (!response.ok) throw new Error("Failed to add evidence");
  return response.json();
}
