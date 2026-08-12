import { Crosshair } from "lucide-react";

interface Props {
  onApply: (tactic: string, technique?: string) => void;
}

export default function MitrePanel({ onApply }: Props) {
  const tactics = [
    "Initial Access", "Execution", "Persistence", "Privilege Escalation",
    "Defense Evasion", "Credential Access", "Discovery", "Lateral Movement",
    "Collection", "Exfiltration", "Command and Control", "Impact"
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <Crosshair className="w-5 h-5 text-soc-accent" />
        MITRE ATT&CK Hunting
      </div>
      <div className="flex flex-wrap gap-2">
        {tactics.map((tactic, idx) => (
          <button 
            key={idx}
            onClick={() => onApply(tactic)}
            className="px-3 py-1.5 bg-soc-bg border border-soc-border hover:border-soc-accent hover:bg-soc-accent/10 rounded-lg text-xs text-soc-text-secondary hover:text-white transition-all shadow-sm"
          >
            {tactic}
          </button>
        ))}
      </div>
    </div>
  );
}
