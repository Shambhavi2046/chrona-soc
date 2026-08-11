export const dynamic = 'force-dynamic';

import { getAnalytics } from "@/services";
import KPIGrid from "@/components/analytics/KPIGrid";
import AttackTrendChart from "@/components/analytics/AttackTrendChart";
import SeverityAnalytics from "@/components/analytics/SeverityAnalytics";
import MitreAssetAnalytics from "@/components/analytics/MitreAssetAnalytics";
import ExecutiveInsights from "@/components/analytics/ExecutiveInsights";
import { BarChart3, Filter } from "lucide-react";

export default async function AnalyticsPage(props: { searchParams: Promise<{ period?: string }> }) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  
  const searchParams = await props.searchParams;
  const period = searchParams.period || "week";

  // Fetch real aggregated analytics from the backend
  const analyticsData = await getAnalytics(token, period);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-soc-accent" />
            Analytics & Security Intelligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Enterprise threat correlation, MITRE mappings, and risk analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button disabled className="flex items-center px-4 py-2 bg-soc-bg/50 border border-soc-border text-gray-500 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed shadow-sm" title="Advanced filtering is currently unavailable">
            <Filter className="w-4 h-4 mr-2" />
            Interactive Filters
          </button>
        </div>
      </div>

      {/* AI Insights (Top-level contextual summary) - Hidden if empty */}
      {analyticsData.aiInsights && analyticsData.aiInsights.length > 0 && (
        <ExecutiveInsights insights={analyticsData.aiInsights} />
      )}

      {/* High-level KPIs */}
      <KPIGrid data={analyticsData.kpis} />

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttackTrendChart data={analyticsData.attackTrends} currentPeriod={period} />
        </div>
        <div>
          <SeverityAnalytics data={analyticsData.threatSeverity} />
        </div>
      </div>

      {/* Secondary Analytics Blocks (MITRE & Assets) */}
      <MitreAssetAnalytics
        topTactics={analyticsData.mitreAnalytics.topTactics}
        assetRisk={analyticsData.assetRisk}
      />

      {/* Additional Analytics Rows can be modularized here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
        <div className="glass-card p-4 rounded-lg flex items-center justify-between border border-soc-border">
          <span className="text-sm text-gray-400">Open Alerts</span>
          <span className="font-mono text-white font-bold">{analyticsData.alertAnalytics.open}</span>
        </div>
        <div className="glass-card p-4 rounded-lg flex items-center justify-between border border-soc-border">
          <span className="text-sm text-gray-400">False Positives (Auto-suppressed)</span>
          <span className="font-mono text-soc-success font-bold">{analyticsData.alertAnalytics.falsePositive}</span>
        </div>
      </div>
    </div>
  );
}
