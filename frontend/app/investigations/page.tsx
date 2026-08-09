import { getAlerts } from "@/services";
import StatCard from "@/components/dashboard/StatCard";
import InvestigationTable from "@/components/investigation/InvestigationTable";
import { Search, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

import GenerateSummaryButton from "@/components/investigation/GenerateSummaryButton";

export default async function InvestigationsOverviewPage() {
  // Fetch real alerts to populate the investigations dashboard
  const alerts = await getAlerts();

  // Dynamically calculate statistics
  const totalInvestigations = alerts.length;
  const criticalThreats = alerts.filter(a => a.risk_score >= 90).length;
  const resolvedInvestigations = alerts.filter(a => a.status.toLowerCase() === 'resolved').length;
  const pendingReviews = alerts.filter(a => a.status.toLowerCase() !== 'resolved').length;

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Search className="w-6 h-6 mr-3 text-soc-accent" />
            Investigations Overview
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage and track AI threat analyses and incident response workflows
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <GenerateSummaryButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Investigations"
          value={totalInvestigations}
          icon={Search}
          colorClass="text-soc-accent border-soc-accent"
        />
        <StatCard
          title="Critical Threats"
          value={criticalThreats}
          icon={ShieldAlert}
          colorClass="text-soc-danger border-soc-danger"
        />
        <StatCard
          title="Pending Reviews"
          value={pendingReviews}
          icon={Clock}
          colorClass="text-soc-warning border-soc-warning"
        />
        <StatCard
          title="Resolved"
          value={resolvedInvestigations}
          icon={CheckCircle2}
          colorClass="text-soc-success border-soc-success"
        />
      </div>

      {/* Investigations Table */}
      <div className="w-full">
        <InvestigationTable investigations={alerts} />
      </div>
    </div>
  );
}
