import { Settings, Zap, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Playbook, ExecutionLog } from "@/types";

interface SummaryCardsProps {
  playbooks?: Playbook[];
  executions?: ExecutionLog[];
}

export default function SummaryCards({ playbooks = [], executions = [] }: SummaryCardsProps) {
  const activePlaybooks = playbooks.filter(p => p.status === 'Active').length;

  const today = new Date();
  today.setHours(0,0,0,0);

  const execsToday = executions.filter(e => {
    if (!e.startTime) return false;
    const d = new Date(e.startTime);
    return d >= today;
  });

  const successCount = executions.filter(e => e.status === 'Success').length;
  const failedCount = executions.filter(e => e.status === 'Failed').length;

  const completedExecs = successCount + failedCount;
  const successRate = completedExecs > 0 ? ((successCount / completedExecs) * 100).toFixed(1) + '%' : '0%';

  const pendingApprovals = executions.filter(e => e.status === 'Pending Approval').length;

  const stats = [
    { label: "Active Playbooks", value: activePlaybooks.toString(), icon: Settings, color: "text-blue-400", bg: "bg-blue-500/10", trend: "Currently active" },
    { label: "Automations Today", value: execsToday.length.toString(), icon: Zap, color: "text-purple-400", bg: "bg-purple-500/10", trend: "Past 24 hours" },
    { label: "Success Rate", value: successRate, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: completedExecs > 0 ? "Based on completed" : "No executions yet" },
    { label: "Failed Executions", value: failedCount.toString(), icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", trend: "Total failed" },
    { label: "Pending Approvals", value: pendingApprovals.toString(), icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10", trend: pendingApprovals > 0 ? "Requires action" : "All clear" },
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
              <p className="text-sm font-medium text-soc-text-secondary truncate">{stat.label}</p>
              <h3 className="text-2xl font-bold text-soc-text-primary mt-1">{stat.value}</h3>
              <p className="text-xs text-soc-text-muted mt-2 truncate">{stat.trend}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
