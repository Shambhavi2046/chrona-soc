import { fetchApi } from "./api";
import { API_URL } from "./config";
import { AnalyticsResponse } from "@/types";

export async function getAnalytics(token?: string): Promise<any> {
  try {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetchApi(`${API_URL}/analytics`, { cache: "no-store", headers });
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
    console.warn("Analytics API unavailable, falling back to mock mode");
    return {
      kpis: {
        totalIncidents: 120,
        activeIncidents: 15,
        criticalIncidents: 3,
        highSeverityAlerts: 8,
        openInvestigations: 12,
        activeThreats: 5,
        highRiskAssets: 2,
        securityScore: 85,
        overallRiskScore: 65,
        threatIntelMatches: 4,
        mttd: "45m",
        mttr: "4.2h",
      },
      attackTrends: [
        { timestamp: "2023-01-01", count: 10 },
        { timestamp: "2023-01-02", count: 15 },
        { timestamp: "2023-01-03", count: 8 },
        { timestamp: "2023-01-04", count: 20 },
      ],
      threatSeverity: [
        { severity: "Critical", count: 5 },
        { severity: "High", count: 12 },
        { severity: "Medium", count: 25 },
        { severity: "Low", count: 40 },
      ],
      mitreAnalytics: {
        topTactics: [
          { tactic: "Execution", count: 12 },
          { tactic: "Persistence", count: 8 },
          { tactic: "Privilege Escalation", count: 6 },
        ]
      },
      assetRisk: [
        { asset: "DB-PROD-01", riskScore: 95, incidents: 3 },
        { asset: "WEB-APP-02", riskScore: 80, incidents: 5 },
      ],
      geographicAnalytics: [
        { country: "US", count: 45 },
        { country: "RU", count: 20 },
        { country: "CN", count: 15 },
      ],
      alertAnalytics: {
        open: 24,
        closed: 156,
        falsePositive: 32,
        suppressed: 12,
      },
      aiInsights: [
        "Unusual authentication pattern detected from multiple offshore IP addresses targeting the production database cluster.",
        "Ransomware indicators match known Threat Actor group activity seen in recent campaigns.",
      ]
    };
  }
}
