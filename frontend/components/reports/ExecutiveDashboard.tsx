import { Activity, TrendingUp, AlertTriangle, Crosshair } from "lucide-react";

interface ExecutiveDashboardProps {
  analytics?: any;
}

export default function ExecutiveDashboard({ analytics }: ExecutiveDashboardProps) {
  const trends = analytics?.attackTrends || [];
  const severities = analytics?.threatSeverity || [];
  const tactics = analytics?.mitreAnalytics?.topTactics || [];

  const totalThreats = trends.reduce((acc: number, t: any) => acc + (t.count || 0), 0);
  const trendHeights = trends.length > 0 ? trends.map((t: any) => Math.min(100, Math.max(10, (t.count / (Math.max(...trends.map((x: any) => x.count)) || 1)) * 100))) : [0,0,0,0,0,0,0];

  const totalSev = severities.reduce((acc: number, s: any) => acc + (s.count || 0), 0) || 1; // prevent div by zero
  const getSevPct = (sev: string) => {
    const s = severities.find((x: any) => x.severity.toLowerCase() === sev.toLowerCase());
    return Math.round(((s?.count || 0) / totalSev) * 100);
  };
  const critPct = getSevPct('critical');
  const highPct = getSevPct('high');
  const medLowPct = getSevPct('medium') + getSevPct('low') + getSevPct('informational');

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6 text-white font-medium">
        <Activity className="w-5 h-5 text-soc-accent" />
        Executive Security Posture
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Trend Widget */}
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-400">Threat Trends (30d)</h4>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{totalThreats}</span>
          </div>
          <div className="h-12 mt-4 flex items-end gap-1">
            {trendHeights.slice(-7).map((h: number, i: number) => (
              <div key={i} className="flex-1 bg-soc-accent/40 rounded-t" style={{ height: `${h || 5}%` }}></div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-400">Risk Distribution</h4>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-red-400">Critical</span>
                <span className="text-white">{critPct}%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${critPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400">High</span>
                <span className="text-white">{highPct}%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${highPct}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Medium/Low</span>
                <span className="text-white">{medLowPct}%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${medLowPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Techniques */}
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-400">Top Attack Techniques</h4>
            <Crosshair className="w-4 h-4 text-soc-warning" />
          </div>
          {tactics.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">No techniques detected in this period.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {tactics.slice(0, 3).map((tac: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate pr-2">{tac.tactic}</span>
                    <span className="font-mono text-soc-accent">{tac.count}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 border-l border-soc-border pl-4">
                {tactics.slice(3, 5).map((tac: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate pr-2">{tac.tactic}</span>
                    <span className="font-mono text-soc-accent">{tac.count}</span>
                  </div>
                ))}
                {tactics.length > 3 && (
                  <div className="flex justify-between text-sm text-gray-500 italic mt-2">
                    <span>View full MITRE matrix &rarr;</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
