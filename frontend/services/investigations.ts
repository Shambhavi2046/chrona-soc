import { API_URL } from "./config";
import { mapToUuid } from "@/utils/idMapping";

export async function getInvestigations(): Promise<any[]> {
  const response = await fetch(`${API_URL}/investigations`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch investigations");
  return response.json();
}

export async function getInvestigation(alertId: string | number): Promise<any> {
  const uuid = mapToUuid(alertId);
  const response = await fetch(`${API_URL}/investigations/by-alert/${uuid}`, { cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) return null; // Return null if not found
    throw new Error("Failed to fetch investigation");
  }
  return response.json();
}

export async function createInvestigation(data: any): Promise<any> {
  const response = await fetch(`${API_URL}/investigations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create investigation");
  return response.json();
}

export async function updateInvestigationStatus(id: string, status: string): Promise<any> {
  const uuid = mapToUuid(id);
  const response = await fetch(`${API_URL}/investigations/${uuid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!response.ok) {
    throw new Error("Failed to update investigation status");
  }
  return response.json();
}
