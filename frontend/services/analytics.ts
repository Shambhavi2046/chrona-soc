import { fetchApi } from "./api";
import { API_URL } from "./config";

export async function getAnalytics(token?: string, period: string = "week"): Promise<any> {
  try {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetchApi(`${API_URL}/analytics?period=${period}`, { cache: "no-store", headers });
    if (!response.ok) throw new Error("Failed to fetch analytics data");
    const data = await response.json();
    return {
      ...data,
      attackTrends: data.attackTrends || [],
      threatSeverity: data.threatSeverity || [],
      mitreAnalytics: data.mitreAnalytics || { topTactics: [] },
      assetRisk: data.assetRisk || [],
      geographicAnalytics: data.geographicAnalytics || [],
      alertAnalytics: data.alertAnalytics || { open: 0, closed: 0, falsePositive: 0, suppressed: 0 },
      aiInsights: data.aiInsights || []
    };
  } catch (error) {
    console.error("Analytics API error:", error);
    // Return empty state instead of fake data if the backend fails
    return {
      kpis: {
        totalIncidents: 0,
        activeIncidents: 0,
        criticalIncidents: 0,
        highSeverityAlerts: 0,
        openInvestigations: 0,
        activeThreats: 0,
        highRiskAssets: 0,
        securityScore: 0,
        overallRiskScore: 0,
        threatIntelMatches: 0,
        mttd: "",
        mttr: "",
      },
      attackTrends: [],
      threatSeverity: [],
      mitreAnalytics: { topTactics: [] },
      assetRisk: [],
      geographicAnalytics: [],
      alertAnalytics: { open: 0, closed: 0, falsePositive: 0, suppressed: 0 },
      aiInsights: []
    };
  }
}
