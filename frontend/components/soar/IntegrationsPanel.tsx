import { Network, Link2, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Integration } from "@/types";

interface IntegrationsPanelProps {
  integrations: Integration[];
}

export default function IntegrationsPanel({ integrations }: IntegrationsPanelProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Network className="w-5 h-5 text-soc-accent" />
          Connected Integrations
        </div>
        <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5" /> Manage
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 max-h-[300px]">
        {integrations.map((int) => (
          <div key={int.id} className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg group hover:border-gray-500 transition-colors">
            <div>
              <h4 className="text-sm font-medium text-soc-text-primary">{int.name}</h4>
              <p className="text-xs text-soc-text-muted">{int.category}</p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`flex items-center text-xs font-medium ${
                int.status === 'Connected' ? 'text-emerald-400' :
                int.status === 'Error' ? 'text-red-400' : 'text-gray-400'
              }`}>
                {int.status === 'Connected' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {int.status === 'Error' && <AlertCircle className="w-3 h-3 mr-1" />}
                {int.status === 'Disconnected' && <Network className="w-3 h-3 mr-1" />}
                {int.status}
              </span>
              <span className="text-[10px] text-soc-text-muted mt-1 flex items-center">
                <RefreshCw className={`w-3 h-3 mr-1 ${int.lastSync === 'Syncing...' ? 'animate-spin' : ''}`} />
                {int.lastSync}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
