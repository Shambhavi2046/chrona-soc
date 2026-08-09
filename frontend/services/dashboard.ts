import { fetchApi } from "./api";
import { API_URL } from "./config";

export async function getDashboardSummary(token?: string) {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/dashboard/summary`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
}

export async function getDashboardMetrics(token?: string) {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/dashboard/metrics`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
  return response.json();
}

export async function getRecentAlerts(token?: string) {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/dashboard/recent-alerts`, { cache: "no-store", headers });
  if (!response.ok) throw new Error("Failed to fetch recent alerts");
  return response.json();
}
