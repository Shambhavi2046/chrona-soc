import { Search, ArrowRight } from "lucide-react";

interface Props {
  onApply: (query: string) => void;
}

export default function AISuggestions({ onApply }: Props) {
  const suggestions = [
    "logon",
    "powershell",
    "cmd.exe",
    "network_traffic",
    "comsvcs.dll",
    "Security"
  ];

  const displayMap: Record<string, string> = {
    "logon": "Search for authentication and logon events.",
    "powershell": "Detect PowerShell execution.",
    "cmd.exe": "Investigate cmd.exe spawning.",
    "network_traffic": "Hunt for outbound network connections.",
    "comsvcs.dll": "Look for memory dumping attempts via comsvcs.",
    "Security": "Search for Security event logs."
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <Search className="w-5 h-5 text-soc-accent" />
        Common Searches
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, idx) => (
          <div 
            key={idx} 
            onClick={() => onApply(suggestion)}
            className="bg-soc-bg border border-soc-border hover:border-soc-accent rounded-lg p-3 transition-colors group cursor-pointer"
          >
            <div className="flex items-start gap-2">
              <Search className="w-4 h-4 text-soc-text-muted flex-shrink-0 mt-0.5" />
              <p className="text-sm text-soc-text-secondary group-hover:text-soc-text-primary transition-colors">{displayMap[suggestion]}</p>
            </div>
            <div className="mt-3 flex justify-end">
              <span className="text-xs font-medium text-soc-accent flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                Run Hunt <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
