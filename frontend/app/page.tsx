import { getDashboardSummary, getRecentAlerts } from "@/services";
import StatCard from "@/components/dashboard/StatCard";
import ThreatOverview from "@/components/dashboard/ThreatOverview";
import IncidentTable from "@/components/dashboard/IncidentTable";
import RiskIndicator from "@/components/dashboard/RiskIndicator";
import { ShieldAlert, AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Fetch real data from backend
  const stats = await getDashboardSummary(token);
  const recentAlerts = await getRecentAlerts(token);
  
  // Select highest risk alert safely
  const topRiskAlert = recentAlerts && recentAlerts.length > 0 
    ? recentAlerts.reduce((prev: any, current: any) => (prev.risk_score > current.risk_score) ? prev : current)
    : null;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soc-text-primary tracking-tight">Security Command Center</h1>
          <p className="text-sm text-soc-text-secondary mt-1">Real-time threat monitoring and incident response</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-soc-text-muted">Last updated: Just now</span>
          <Link href="/reports">
            <button className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/90 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              Generate Report
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={stats.total_alerts}
          icon={ShieldAlert}
          trend="neutral"
          trendValue="--"
          colorClass="text-soc-accent border-soc-accent"
          href="/alerts"
        />
        <StatCard
          title="Critical Alerts"
          value={stats.critical_alerts}
          icon={AlertTriangle}
          trend="neutral"
          trendValue="--"
          colorClass="text-soc-danger border-soc-danger"
          href="/alerts?severity=critical"
        />
        <StatCard
          title="Open Cases"
          value={stats.open_cases}
          icon={CheckCircle2}
          trend="neutral"
          trendValue="--"
          colorClass="text-soc-success border-soc-success"
          href="/cases"
        />
        <StatCard
          title="Active Playbooks"
          value={stats.active_playbooks}
          icon={Shield}
          trend="neutral"
          trendValue="--"
          colorClass="text-soc-warning border-soc-warning"
          href="/soar"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - spans 2 cols on lg screens */}
        <div className="lg:col-span-2 space-y-6">
          <ThreatOverview />
        </div>

        {/* Right column - spans 1 col */}
        <div className="space-y-6">
          <RiskIndicator topThreat={topRiskAlert} />
        </div>
      </div>

      {/* Full width table */}
      <div>
        <IncidentTable incidents={recentAlerts} />
      </div>
    </div>
  );
}