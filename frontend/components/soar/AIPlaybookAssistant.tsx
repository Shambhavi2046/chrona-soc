import { Bot, Sparkles } from "lucide-react";

export default function AIPlaybookAssistant() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 text-soc-text-primary font-medium">
        <Bot className="w-5 h-5 text-soc-accent" />
        AI Playbook Assistant
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-soc-bg border border-soc-border rounded-lg border-dashed mb-4">
        <Sparkles className="w-8 h-8 text-soc-text-muted mb-3" />
        <h4 className="text-sm font-medium text-soc-text-primary mb-1">Coming soon</h4>
        <p className="text-xs text-soc-text-secondary">
          AI-assisted playbook generation is not yet connected.
        </p>
      </div>

      <div className="mt-auto">
        <input
          type="text"
          placeholder="Ask Copilot to build or explain a workflow..."
          disabled
          className="w-full bg-soc-bg/50 border border-soc-border rounded-lg px-3 py-2.5 text-sm text-soc-text-secondary placeholder-gray-600 focus:outline-none cursor-not-allowed"
        />
      </div>
    </div>
  );
}
