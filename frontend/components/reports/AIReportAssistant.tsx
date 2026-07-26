import { Bot, Sparkles, Wand2 } from "lucide-react";

export default function AIReportAssistant() {
  const suggestions = [
    "Generate Executive Summary for last month",
    "Summarise CASE-409 findings",
    "Highlight Critical SOC 2 Audit Gaps",
    "Recommend Mitigations for T1059.001",
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 text-white font-medium">
        <Bot className="w-5 h-5 text-soc-accent" />
        AI Report Assistant
      </div>
      <div className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div key={idx} className="bg-soc-bg border border-soc-border hover:border-soc-accent rounded-lg p-3 transition-colors group cursor-pointer flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-soc-warning flex-shrink-0" />
              <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{suggestion}</p>
            </div>
            <button className="text-xs font-medium text-soc-accent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-soc-accent/10 px-2 py-1 rounded">
              <Wand2 className="w-3 h-3" /> Generate
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Ask Copilot to draft a specific report section..." 
          className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-soc-accent"
        />
      </div>
    </div>
  );
}
