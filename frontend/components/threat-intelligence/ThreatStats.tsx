import StatCard from "@/components/dashboard/StatCard";
import { Network, ShieldAlert, Shield, Globe } from "lucide-react";

interface ThreatStatsProps {
  activeThreats: number;
  criticalIndicators: number;
  blockedIocs: number;
  threatScore: number;
}

export default function ThreatStats({
  activeThreats,
  criticalIndicators,
  blockedIocs,
  threatScore,
}: ThreatStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Threats"
        value={activeThreats}
        icon={Network}
        trend="up"
        trendValue="+12%"
        colorClass="text-soc-accent border-soc-accent"
      />
      <StatCard
        title="Critical Indicators"
        value={criticalIndicators}
        icon={ShieldAlert}
        trend="up"
        trendValue="+5%"
        colorClass="text-soc-danger border-soc-danger"
      />
      <StatCard
        title="Blocked IOCs"
        value={blockedIocs}
        icon={Shield}
        trend="down"
        trendValue="-2%"
        colorClass="text-soc-success border-soc-success"
      />
      <StatCard
        title="Global Threat Score"
        value={`${threatScore}/100`}
        icon={Globe}
        colorClass="text-soc-warning border-soc-warning"
      />
    </div>
  );
}
