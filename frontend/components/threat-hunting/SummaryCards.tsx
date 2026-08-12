import { Search, Database, Target, AlertTriangle, ShieldAlert } from "lucide-react";
import { HuntEvent } from "@/types";

interface Props {
  events?: HuntEvent[];
}

export default function SummaryCards({ events = [] }: Props) {
  const highRisk = events.filter(e => e.severity.toLowerCase() === 'critical' || e.severity.toLowerCase() === 'high').length;
  const iocMatches = events.filter(e => !!e.ioc_match).length;
  
  const stats = [
    { label: "Active Hunts", value: "1", icon: Search, color: "text-blue-400", bg: "bg-blue-500/10", trend: "Current Session" },
    { label: "Saved Queries", value: "System", icon: Database, color: "text-purple-400", bg: "bg-purple-500/10", trend: "Available" },
    { label: "Matching Events", value: events.length.toString(), icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Current Query" },
    { label: "High-Risk Findings", value: highRisk.toString(), icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", trend: "Requires review" },
    { label: "Recent IOC Matches", value: iocMatches.toString(), icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", trend: "Critical" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div 
            key={idx} 
            className="glass-card p-4 rounded-xl border border-soc-border hover:border-soc-accent/50 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.1)] group relative overflow-hidden"
          >
            <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${stat.bg} blur-2xl group-hover:bg-opacity-100 transition-all`} />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-medium text-soc-text-secondary">{stat.label}</p>
              <h3 className="text-2xl font-bold text-soc-text-primary mt-1">{stat.value}</h3>
              <p className="text-xs text-soc-text-muted mt-2">{stat.trend}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
