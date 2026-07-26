import { mapToUuid } from "@/utils/idMapping";
import { API_URL } from "./config";
import { Alert, InvestigationResponse } from "@/types";

export async function getAlerts(): Promise<Alert[]> {
  const response = await fetch(`${API_URL}/alerts`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch alerts data");
  return response.json();
}

export async function getAlertById(alertId: string | number): Promise<Alert> {
  const uuid = mapToUuid(alertId);
  const response = await fetch(`${API_URL}/alerts/${uuid}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch alert data");
  return response.json();
}
