import { Bot, Sparkles, Wand2 } from "lucide-react";

export default function AIPlaybookAssistant() {
  const suggestions = [
    "Generate Ransomware Containment Playbook",
    "Optimise IOC Enrichment Workflow",
    "Explain Failure in EXEC-8893",
    "Recommend Automation for Phishing",
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <Bot className="w-5 h-5 text-soc-accent" />
        AI Playbook Assistant
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-soc-bg border border-soc-border hover:border-soc-accent rounded-lg p-3 transition-colors group cursor-pointer flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-soc-warning flex-shrink-0" />
              <p className="text-sm text-soc-text-secondary group-hover:text-soc-text-primary transition-colors">{suggestion}</p>
            </div>
            <button className="text-xs font-medium text-soc-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-soc-accent/10 px-2 py-1 rounded">
              <Wand2 className="w-3 h-3" /> Execute
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Ask Copilot to build or explain a workflow..." 
          className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2.5 text-sm text-soc-text-primary placeholder-gray-500 focus:outline-none focus:border-soc-accent"
        />
      </div>
    </div>
  );
}
