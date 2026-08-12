import { FileText, Calendar, ShieldCheck, AlertTriangle, AlertOctagon, Download } from "lucide-react";

interface SummaryCardsProps {
  reportCount: number;
  analytics?: any;
}

export default function SummaryCards({ reportCount, analytics }: SummaryCardsProps) {
  const kpis = analytics?.kpis || {};
  
  const stats = [
    { label: "Generated Reports", value: reportCount.toString(), icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", trend: "" },
    { label: "Compliance Score", value: kpis.securityScore ? `${kpis.securityScore}%` : "0%", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: "Security posture" },
    { label: "Open Findings", value: (kpis.openInvestigations || 0).toString(), icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10", trend: "Active investigations" },
    { label: "Critical Risks", value: (kpis.criticalIncidents || 0).toString(), icon: AlertOctagon, color: "text-red-400", bg: "bg-red-500/10", trend: "Requires attention" },
    { label: "Threat Intel Matches", value: (kpis.threatIntelMatches || 0).toString(), icon: ShieldCheck, color: "text-purple-400", bg: "bg-purple-500/10", trend: "IoC detections" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
              <p className="text-sm font-medium text-gray-400 truncate">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              <p className="text-xs text-gray-500 mt-2 truncate">{stat.trend}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
