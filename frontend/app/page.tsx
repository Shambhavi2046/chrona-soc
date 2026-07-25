import { getDashboardStats } from "@/lib/api";
import StatCard from "@/components/dashboard/StatCard";
import ThreatOverview from "@/components/dashboard/ThreatOverview";
import IncidentTable from "@/components/dashboard/IncidentTable";
import RiskIndicator from "@/components/dashboard/RiskIndicator";
import { ShieldAlert, AlertTriangle, CheckCircle2, Shield } from "lucide-react";

export default async function Home() {
  // Fetch real data from backend
  const stats = await getDashboardStats();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Command Center</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time threat monitoring and incident response</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Last updated: Just now</span>
          <button className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/90 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Alerts"
          value={stats.total_alerts}
          icon={ShieldAlert}
          trend="up"
          trendValue="12%"
          colorClass="text-soc-accent border-soc-accent"
        />
        <StatCard
          title="Active Threats"
          value={stats.open_alerts}
          icon={AlertTriangle}
          trend="up"
          trendValue="5%"
          colorClass="text-soc-danger border-soc-danger"
        />
        <StatCard
          title="Resolved Incidents"
          value={stats.resolved_alerts}
          icon={CheckCircle2}
          trend="down"
          trendValue="2%"
          colorClass="text-soc-success border-soc-success"
        />
        <StatCard
          title="High Risk Events"
          value={stats.high_risk_alerts}
          icon={Shield}
          trend="neutral"
          trendValue="0%"
          colorClass="text-soc-warning border-soc-warning"
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
          <RiskIndicator topThreat={stats.top_threat} />
        </div>
      </div>

      {/* Full width table */}
      <div>
        <IncidentTable />
      </div>
    </div>
  );
}