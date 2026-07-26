import { API_URL } from "./config";

export async function getDashboardSummary() {
  const response = await fetch(`${API_URL}/dashboard/summary`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch dashboard summary");
  return response.json();
}

export async function getDashboardMetrics() {
  const response = await fetch(`${API_URL}/dashboard/metrics`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch dashboard metrics");
  return response.json();
}

export async function getRecentAlerts() {
  const response = await fetch(`${API_URL}/dashboard/recent-alerts`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch recent alerts");
  return response.json();
}
