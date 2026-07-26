import { Network, Plus, ServerCrash, CheckCircle2, RotateCw } from "lucide-react";
import { IntegrationStatus } from "@/types";

interface IntegrationSettingsProps {
  integrations: IntegrationStatus[];
}

export default function IntegrationSettings({ integrations }: IntegrationSettingsProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-soc-accent" />
            Connected Integrations
          </h2>
          <p className="text-sm text-gray-400 mt-1">Manage data ingests, SIEM connections, and SOAR endpoints.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Integration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <div key={int.id} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-white">{int.name}</h4>
              {int.status === "Connected" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {int.status === "Disconnected" && <div className="w-2 h-2 rounded-full bg-gray-500 mt-1" />}
              {int.status === "Error" && <ServerCrash className="w-4 h-4 text-red-400" />}
            </div>
            
            <div className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${
                  int.status === "Connected" ? "text-emerald-400" :
                  int.status === "Error" ? "text-red-400" : "text-gray-400"
                }`}>
                  {int.status}
                </span>
              </div>
              
              {int.status !== "Disconnected" && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last Sync</span>
                  <span className="text-gray-300 flex items-center gap-1">
                    <RotateCw className="w-3 h-3" /> {int.lastSync}
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-soc-border/50 flex gap-2">
                {int.status === "Disconnected" ? (
                  <button className="flex-1 py-1.5 bg-soc-card hover:bg-soc-border border border-soc-border rounded text-xs font-medium text-white transition-colors">Connect</button>
                ) : (
                  <>
                    <button className="flex-1 py-1.5 bg-soc-card hover:bg-soc-border border border-soc-border rounded text-xs font-medium text-white transition-colors">Configure</button>
                    <button className="py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-xs font-medium text-red-400 transition-colors">Disconnect</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
