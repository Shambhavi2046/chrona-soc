import { ShieldAlert, Activity, Wifi } from "lucide-react";
import Link from "next/link";

export default function ThreatOverview() {
  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Threat Activity Overview</h3>
        <Link href="/alerts">
          <button className="text-xs text-soc-accent hover:text-white transition-colors">View All</button>
        </Link>
      </div>

      <div className="space-y-6 flex-1">
        {/* Security Posture */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-400">Security Posture</span>
            <span className="text-sm font-bold text-soc-success">85% Optimal</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden">
            <div className="h-full bg-soc-success w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          </div>
        </div>

        {/* Attack Frequency */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-400">Attack Frequency</span>
            <span className="text-sm font-bold text-soc-warning">Elevated</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden flex">
            <div className="h-full bg-soc-success w-1/2"></div>
            <div className="h-full bg-soc-warning w-1/3 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <div className="h-full bg-soc-bg w-1/6"></div>
          </div>
        </div>

        {/* Global Threat Level */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-gray-400">Global Threat Level</span>
            <span className="text-sm font-bold text-soc-danger">Critical</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden">
            <div className="h-full bg-soc-danger w-[92%] rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-soc-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <ShieldAlert className="w-5 h-5 text-soc-warning mx-auto mb-1" />
          <span className="block text-xl font-bold text-white">24</span>
          <span className="text-xs text-gray-500">Active</span>
        </div>
        <div className="text-center border-l border-r border-soc-border">
          <Activity className="w-5 h-5 text-soc-accent mx-auto mb-1" />
          <span className="block text-xl font-bold text-white">12k</span>
          <span className="text-xs text-gray-500">Events/s</span>
        </div>
        <div className="text-center">
          <Wifi className="w-5 h-5 text-soc-success mx-auto mb-1" />
          <span className="block text-xl font-bold text-white">99%</span>
          <span className="text-xs text-gray-500">Uptime</span>
        </div>
      </div>
    </div>
  );
}
