import { Bot, Sparkles, Database, ShieldAlert, Cpu } from "lucide-react";

export default function AICopilotSettings() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      <section>
        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-soc-accent/10 border border-soc-accent/30 flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-soc-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-soc-text-primary">AI Security Copilot</h2>
            <p className="text-sm text-soc-text-secondary mt-1">Configure the behavior, memory, and models powering your enterprise AI assistant.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-soc-text-secondary flex items-center gap-2"><Cpu className="w-3.5 h-3.5" /> Preferred Model</label>
            <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
              <option>Gemini 1.5 Pro (Google SecOps)</option>
              <option>GPT-4o (Azure OpenAI)</option>
              <option>Claude 3.5 Sonnet</option>
              <option>Local Llama 3 (On-Premise)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-soc-text-secondary flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Response Style</label>
            <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
              <option>Concise & Direct (Default)</option>
              <option>Detailed & Explanatory</option>
              <option>Executive Summary</option>
            </select>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-md font-bold text-soc-text-primary mb-4">Features & Context</h3>
        <div className="space-y-3">
          
          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div>
              <h4 className="text-sm font-medium text-soc-text-primary flex items-center gap-2"><Database className="w-4 h-4 text-purple-400" /> Context Retention</h4>
              <p className="text-xs text-soc-text-muted mt-0.5 max-w-lg">Allow the Copilot to automatically reference active cases, alerts, and assets without explicit mention.</p>
            </div>
            <button className="w-8 h-4 rounded-full relative bg-soc-accent transition-colors shrink-0">
              <div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white transition-transform" />
            </button>
          </div>

          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div>
              <h4 className="text-sm font-medium text-soc-text-primary flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-emerald-400" /> Proactive AI Suggestions</h4>
              <p className="text-xs text-soc-text-muted mt-0.5 max-w-lg">Copilot will autonomously suggest Threat Hunting queries or SOAR playbooks based on dashboard context.</p>
            </div>
            <button className="w-8 h-4 rounded-full relative bg-soc-accent transition-colors shrink-0">
              <div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white transition-transform" />
            </button>
          </div>

        </div>
      </section>

      <section>
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h4 className="text-sm font-bold text-red-400 mb-1">Privacy & Data Residency</h4>
          <p className="text-xs text-soc-text-secondary mb-3">Enterprise policies prevent PII and sensitive artifact strings from being sent to external LLM providers. Data is processed in the US-West-2 region.</p>
          <button className="text-xs font-medium text-soc-text-primary bg-soc-card hover:bg-soc-bg border border-soc-border px-3 py-1.5 rounded transition-colors">
            View Audit Report
          </button>
        </div>
      </section>

    </div>
  );
}
