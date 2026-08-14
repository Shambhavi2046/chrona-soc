import { BarChart3, TrendingUp, Activity, Clock } from "lucide-react";
import { ExecutionLog } from "@/types";

interface AnalyticsProps {
  executions?: ExecutionLog[];
}

export default function Analytics({ executions = [] }: AnalyticsProps) {
  const getDurationSeconds = (d: string) => {
    if (!d || d === "N/A") return 0;
    if (d.includes('m')) {
      const parts = d.split('m');
      const m = parseFloat(parts[0]) || 0;
      const s = parseFloat(parts[1]?.replace('s', '')) || 0;
      return m * 60 + s;
    }
    return parseFloat(d.replace('s', '')) || 0;
  };

  const getAvgExecutionTime = () => {
    let totalSeconds = 0;
    let count = 0;
    executions.forEach(e => {
      if (e.status === 'Success' || e.status === 'Failed') {
        totalSeconds += getDurationSeconds(e.duration);
        count++;
      }
    });
    return count > 0 ? (totalSeconds / count).toFixed(2) + "s" : "0s";
  };

  const successCount = executions.filter(e => e.status === 'Success').length;
  const completedExecs = executions.filter(e => e.status === 'Success' || e.status === 'Failed').length;
  const successRate = completedExecs > 0 ? Math.round((successCount / completedExecs) * 100) + "%" : "0%";

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0,0,0,0);
    return d;
  });

  const executionsPerDay = last7Days.map(date => {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    return executions.filter(e => {
      if (!e.startTime) return false;
      const t = new Date(e.startTime);
      return t >= date && t < nextDay;
    }).length;
  });

  const maxExecs = Math.max(...executionsPerDay, 1);

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <BarChart3 className="w-5 h-5 text-soc-accent" />
        Automation Analytics
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-soc-text-secondary">Avg. Execution Time</h4>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-soc-text-primary">{getAvgExecutionTime()}</span>
            <span className="text-xs text-soc-text-muted mb-1">N/A</span>
          </div>
        </div>

        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-soc-text-secondary">Success Rate</h4>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-soc-text-primary">{successRate}</span>
            <span className="text-xs text-soc-text-muted mb-1">N/A</span>
          </div>
        </div>

        <div className="col-span-2 bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-medium text-soc-text-secondary">Executions (Last 7 Days)</h4>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="h-24 flex items-end gap-2">
            {executionsPerDay.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-1 group relative">
                <div className="w-full bg-soc-accent/40 rounded-t group-hover:bg-soc-accent transition-colors" style={{ height: `${(count / maxExecs) * 100}%` }}></div>
                {/* Tooltip */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-soc-card border border-soc-border px-2 py-1 rounded text-[10px] text-soc-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {count} Executions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
