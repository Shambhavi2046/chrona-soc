"use client";

import { BrainCircuit } from "lucide-react";

interface ExecutiveInsightsProps {
  insights: string[];
}

export default function ExecutiveInsights({ insights }: ExecutiveInsightsProps) {
  return (
    <div className="glass-card rounded-xl p-6 border-l-4 border-l-soc-accent relative overflow-hidden group">
      <div className="absolute right-0 top-0 -mt-4 -mr-4 text-soc-accent/10 pointer-events-none transition-transform duration-700 group-hover:scale-110">
        <BrainCircuit className="w-32 h-32" />
      </div>
      
      <div className="flex items-center mb-6 relative z-10">
        <div className="p-2 bg-soc-accent/20 rounded-lg mr-3 glow-accent">
          <BrainCircuit className="w-5 h-5 text-soc-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-soc-text-primary">Executive AI Insights</h3>
          <p className="text-xs text-soc-text-secondary">Automated synthesis of current SOC telemetry</p>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="bg-soc-bg border border-soc-border rounded-lg p-4 flex items-start">
            <span className="text-soc-accent mr-3 mt-1 text-lg leading-none">•</span>
            <p className="text-sm text-soc-text-secondary font-medium leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
