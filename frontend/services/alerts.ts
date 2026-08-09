import { fetchApi } from "./api";
import { mapToUuid } from "@/utils/idMapping";
import { API_URL } from "./config";
import { Alert, InvestigationResponse } from "@/types";

export async function getAlerts(token?: string): Promise<Alert[]> {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/alerts`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch alerts data");
  return response.json();
}

export async function getAlertById(alertId: string | number, token?: string): Promise<Alert> {
  const uuid = mapToUuid(alertId);
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/alerts/${uuid}`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch alert data");
  return response.json();
}

export async function createAlert(data: Partial<Alert>): Promise<Alert> {
  const response = await fetchApi(`${API_URL}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create alert");
  return response.json();
}
