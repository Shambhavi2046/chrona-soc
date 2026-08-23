import { ShieldAlert, Activity, Wifi } from "lucide-react";
import Link from "next/link";

export default function ThreatOverview() {
  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-soc-text-primary">Threat Activity Overview</h3>
        <Link href="/alerts">
          <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors">View All</button>
        </Link>
      </div>

      <div className="space-y-6 flex-1">
        {/* Security Posture */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-soc-text-secondary">Security Posture</span>
            <span className="text-sm font-bold text-soc-text-muted">Unavailable</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden">
            <div className="h-full bg-soc-bg w-[0%] rounded-full"></div>
          </div>
        </div>

        {/* Attack Frequency */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-soc-text-secondary">Attack Frequency</span>
            <span className="text-sm font-bold text-soc-text-muted">Unavailable</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden flex">
            <div className="h-full bg-soc-bg w-full"></div>
          </div>
        </div>

        {/* Global Threat Level */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-soc-text-secondary">Global Threat Level</span>
            <span className="text-sm font-bold text-soc-text-muted">Unavailable</span>
          </div>
          <div className="h-2 w-full bg-soc-bg rounded-full overflow-hidden">
            <div className="h-full bg-soc-bg w-[0%] rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-soc-border grid grid-cols-3 gap-4">
        <div className="text-center">
          <ShieldAlert className="w-5 h-5 text-soc-text-muted mx-auto mb-1" />
          <span className="block text-xl font-bold text-soc-text-muted">--</span>
          <span className="text-xs text-soc-text-muted">Active</span>
        </div>
        <div className="text-center border-l border-r border-soc-border">
          <Activity className="w-5 h-5 text-soc-text-muted mx-auto mb-1" />
          <span className="block text-xl font-bold text-soc-text-muted">--</span>
          <span className="text-xs text-soc-text-muted">Events/s</span>
        </div>
        <div className="text-center">
          <Wifi className="w-5 h-5 text-soc-text-muted mx-auto mb-1" />
          <span className="block text-xl font-bold text-soc-text-muted">--</span>
          <span className="text-xs text-soc-text-muted">Uptime</span>
        </div>
      </div>
    </div>
  );
}
