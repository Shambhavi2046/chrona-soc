import { Shield, ChevronRight, AlertTriangle } from "lucide-react";
import { ComplianceFramework } from "@/types";

interface FrameworkCardsProps {
  frameworks: ComplianceFramework[];
}

export default function FrameworkCards({ frameworks }: FrameworkCardsProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Shield className="w-5 h-5 text-soc-accent" />
          Framework Coverage
        </div>
        <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors">
          Manage Mappings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {frameworks.map((fw) => (
          <div key={fw.id} className="bg-soc-bg border border-soc-border rounded-lg p-4 group hover:border-soc-accent/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-bold text-soc-text-primary group-hover:text-soc-accent transition-colors">{fw.name}</h4>
                <p className="text-xs text-soc-text-muted mt-1">{fw.mappedControls} Mapped Controls</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                fw.status === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                fw.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {fw.status}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-soc-text-secondary">Coverage</span>
                <span className="text-soc-text-primary font-medium">{fw.coverage}%</span>
              </div>
              <div className="w-full bg-soc-card rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${fw.coverage > 90 ? 'bg-emerald-500' : fw.coverage > 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${fw.coverage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-soc-border/50">
              {fw.findings > 0 ? (
                <span className="text-xs font-medium text-soc-warning flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  {fw.findings} Findings
                </span>
              ) : (
                <span className="text-xs text-emerald-400">All controls passing</span>
              )}
              <ChevronRight className="w-4 h-4 text-soc-text-muted group-hover:text-soc-text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
