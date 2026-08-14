import { Network, Link2, AlertCircle } from "lucide-react";
import { Integration } from "@/types";

interface IntegrationsPanelProps {
  integrations?: Integration[];
}

export default function IntegrationsPanel({ integrations = [] }: IntegrationsPanelProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Network className="w-5 h-5 text-soc-accent" />
          Connected Integrations
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-soc-bg border border-soc-border rounded-lg border-dashed">
        <AlertCircle className="w-8 h-8 text-soc-text-muted mb-3" />
        <h4 className="text-sm font-medium text-soc-text-primary mb-1">No integrations configured</h4>
        <p className="text-xs text-soc-text-secondary">
          Integration management is not yet connected to a live backend.
        </p>
      </div>
    </div>
  );
}
