import { Filter } from "lucide-react";
import { HuntQueryRequest } from "@/types";

interface Props {
  query: HuntQueryRequest;
  onUpdate: (q: Partial<HuntQueryRequest>) => void;
  onRun: (q?: Partial<HuntQueryRequest>) => void;
}

export default function FilterPanel({ query, onUpdate, onRun }: Props) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <Filter className="w-4 h-4 text-soc-accent" />
        Filters
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="relative">
          <label className="block text-xs text-soc-text-muted mb-1">Time Range</label>
          <select 
            className="w-full px-3 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm text-soc-text-secondary transition-colors focus:outline-none focus:border-soc-accent appearance-none"
            value={query.start_time || ""}
            onChange={(e) => {
               const val = { start_time: e.target.value };
               onUpdate(val);
               onRun(val);
            }}
          >
            <option value="">Any Time</option>
            <option value="last_24">Last 24 Hours</option>
            <option value="last_7">Last 7 Days</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-xs text-soc-text-muted mb-1">Severity</label>
          <select 
            className="w-full px-3 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm text-soc-text-secondary transition-colors focus:outline-none focus:border-soc-accent appearance-none"
            value={query.severity || ""}
            onChange={(e) => {
               const val = { severity: e.target.value };
               onUpdate(val);
               onRun(val);
            }}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="relative">
          <label className="block text-xs text-soc-text-muted mb-1">MITRE Tactic</label>
          <select 
            className="w-full px-3 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm text-soc-text-secondary transition-colors focus:outline-none focus:border-soc-accent appearance-none"
            value={query.mitre_tactic || ""}
            onChange={(e) => {
               const val = { mitre_tactic: e.target.value };
               onUpdate(val);
               onRun(val);
            }}
          >
            <option value="">Any Tactic</option>
            <option value="Initial Access">Initial Access</option>
            <option value="Execution">Execution</option>
            <option value="Persistence">Persistence</option>
            <option value="Privilege Escalation">Privilege Escalation</option>
            <option value="Defense Evasion">Defense Evasion</option>
            <option value="Credential Access">Credential Access</option>
            <option value="Discovery">Discovery</option>
            <option value="Lateral Movement">Lateral Movement</option>
            <option value="Collection">Collection</option>
            <option value="Command and Control">Command and Control</option>
            <option value="Exfiltration">Exfiltration</option>
            <option value="Impact">Impact</option>
          </select>
        </div>
      </div>
    </div>
  );
}
