import { Activity, TrendingUp, AlertTriangle, Crosshair } from "lucide-react";

export default function ExecutiveDashboard() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6 text-white font-medium">
        <Activity className="w-5 h-5 text-soc-accent" />
        Executive Security Posture
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Trend Widget 1 */}
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-400">Threat Trends (30d)</h4>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">412</span>
            <span className="text-sm text-emerald-400 mb-1">-14% vs prev</span>
          </div>
          <div className="h-12 mt-4 flex items-end gap-1">
            {[40, 60, 45, 80, 55, 30, 20].map((h, i) => (
              <div key={i} className="flex-1 bg-soc-accent/40 rounded-t" style={{ height: `${h}%` }}></div>
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
                <span className="text-white">8%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-orange-400">High</span>
                <span className="text-white">24%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '24%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400">Medium/Low</span>
                <span className="text-white">68%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '68%' }}></div>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">T1059.001 - PowerShell</span>
                <span className="font-mono text-soc-accent">142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">T1078 - Valid Accounts</span>
                <span className="font-mono text-soc-accent">98</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">T1190 - Exploit Public App</span>
                <span className="font-mono text-soc-accent">64</span>
              </div>
            </div>
            <div className="space-y-2 border-l border-soc-border pl-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">T1003 - OS Credential Dump</span>
                <span className="font-mono text-soc-accent">41</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">T1571 - Non-Standard Port</span>
                <span className="font-mono text-soc-accent">27</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 italic mt-2">
                <span>View full MITRE matrix &rarr;</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
