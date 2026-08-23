import { fetchApi } from "./api";
import { API_URL } from "./config";
import { mapToUuid } from "@/utils/idMapping";

export async function getInvestigations(token?: string): Promise<any[]> {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/investigations`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch investigations");
  return response.json();
}

export async function getInvestigation(alertId: string | number, token?: string): Promise<any> {
  const uuid = mapToUuid(alertId);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/investigations/by-alert/${uuid}`, { cache: "no-store", headers });
  if (!response.ok) {
    if (response.status === 404) return null; // Return null if not found
    throw new Error("Failed to fetch investigation");
  }
  return response.json();
}

export async function createInvestigation(data: any): Promise<any> {
  const response = await fetchApi(`${API_URL}/investigations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create investigation");
  return response.json();
}

export async function updateInvestigationStatus(id: string, status: string): Promise<any> {
  const uuid = mapToUuid(id);
  const response = await fetchApi(`${API_URL}/investigations/${uuid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    throw new Error("Failed to update investigation status");
  }
  return response.json();
}

export async function generateInvestigationsSummary(): Promise<{summary: string}> {
  const response = await fetchApi(`${API_URL}/investigations/summary/overview`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to generate investigations summary");
  }
  return response.json();
}

export async function escalateInvestigation(id: string): Promise<any> {
  const uuid = mapToUuid(id);
  const response = await fetchApi(`${API_URL}/investigations/${uuid}/escalate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || "Failed to escalate investigation");
  }
  return response.json();
}
