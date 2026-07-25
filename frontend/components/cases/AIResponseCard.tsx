"use client";

import { BrainCircuit, Shield } from "lucide-react";

import { AIRecommendation } from "@/lib/api";

interface AIResponseCardProps {
  summary: string;
  recommendations: AIRecommendation[];
}

export default function AIResponseCard({ summary, recommendations }: AIResponseCardProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border border-soc-border">
      <div className="p-6 border-b border-soc-border bg-soc-bg/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BrainCircuit className="w-5 h-5 text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">AI Analyst Summary</h3>
          </div>
          <span className="text-xs font-mono text-purple-400 border border-purple-400/30 px-2 py-1 rounded">Auto-Generated</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-6">
        <div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {summary || "No AI summary available for this case yet. The model requires more evidence to synthesize a conclusion."}
          </p>
        </div>

        {recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center mb-3">
              <Shield className="w-4 h-4 text-soc-success mr-2" />
              Recommended Actions
            </h4>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex flex-col p-4 bg-soc-bg border border-soc-border rounded-lg group hover:border-soc-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${rec.priority === 'Critical' ? 'bg-soc-danger' : rec.priority === 'High' ? 'bg-soc-warning' : 'bg-soc-success'}`}></div>
                      <span className="text-sm font-semibold text-white">{rec.action}</span>
                    </div>
                    <button className="text-xs px-3 py-1.5 bg-soc-card border border-soc-border hover:border-soc-accent hover:bg-soc-accent/10 text-soc-accent font-medium rounded transition-colors opacity-0 group-hover:opacity-100">
                      Execute Action
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-mono pl-4">
                    <span>PRIORITY: <span className={rec.priority === 'Critical' ? 'text-soc-danger' : 'text-gray-300'}>{rec.priority}</span></span>
                    <span>CONFIDENCE: <span className="text-soc-success">{rec.confidence}%</span></span>
                    <span>IMPACT: <span className="text-gray-300">{rec.impact}</span></span>
                    <span>STATUS: <span className="text-soc-warning">{rec.status}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
