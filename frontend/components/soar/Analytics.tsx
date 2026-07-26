import { BarChart3, TrendingUp, Activity, Clock } from "lucide-react";

export default function Analytics() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4 text-white font-medium">
        <BarChart3 className="w-5 h-5 text-soc-accent" />
        Automation Analytics
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-400">Avg. Execution Time</h4>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">4.2s</span>
            <span className="text-xs text-emerald-400 mb-1">-1.1s</span>
          </div>
        </div>

        <div className="bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-gray-400">Success Rate</h4>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white">98%</span>
            <span className="text-xs text-emerald-400 mb-1">+2%</span>
          </div>
        </div>

        <div className="col-span-2 bg-soc-bg border border-soc-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-medium text-gray-400">Executions (Last 7 Days)</h4>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="h-24 flex items-end gap-2">
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col justify-end h-full gap-1 group relative">
                <div className="w-full bg-soc-accent/40 rounded-t group-hover:bg-soc-accent transition-colors" style={{ height: `${h}%` }}></div>
                {/* Tooltip */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-soc-card border border-soc-border px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {h * 12} Executions
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
