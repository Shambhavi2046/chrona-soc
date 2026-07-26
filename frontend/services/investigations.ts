import { API_URL } from "./config";

export async function getInvestigations(): Promise<any[]> {
  const response = await fetch(`${API_URL}/investigations`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch investigations");
  return response.json();
}

export async function getInvestigation(alertId: string | number): Promise<any> {
  const response = await fetch(`${API_URL}/investigations/by-alert/${alertId}`, { cache: "no-store" });
  if (!response.ok) {
    if (response.status === 404) return null; // Return null if not found
    throw new Error("Failed to fetch investigation");
  }
  return response.json();
}
