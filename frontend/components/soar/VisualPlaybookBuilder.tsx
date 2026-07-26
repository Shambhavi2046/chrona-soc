import { GitMerge, Zap, Shield, HelpCircle, Mail, Database, X, AlertTriangle, Play } from "lucide-react";

export default function VisualPlaybookBuilder() {
  const nodes = [
    { id: 1, type: "Trigger", title: "Email Alert Received", icon: Mail, color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/10" },
    { id: 2, type: "Condition", title: "Is Phishing?", icon: HelpCircle, color: "text-purple-400", border: "border-purple-500/50", bg: "bg-purple-500/10" },
    { id: 3, type: "Integration", title: "Extract IOCs (ThreatFox)", icon: Database, color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" },
    { id: 4, type: "Decision", title: "Severity > High?", icon: GitMerge, color: "text-orange-400", border: "border-orange-500/50", bg: "bg-orange-500/10" },
    { id: 5, type: "Action", title: "Quarantine User", icon: Shield, color: "text-red-400", border: "border-red-500/50", bg: "bg-red-500/10" },
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-soc-border">
        <div className="flex items-center gap-2 text-white font-medium">
          <Zap className="w-5 h-5 text-soc-accent" />
          Playbook Builder: <span className="text-gray-400 font-normal">Phishing Response (Draft)</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-soc-bg border border-soc-border hover:border-gray-500 rounded text-xs font-medium text-gray-300 transition-colors">Discard</button>
          <button className="px-3 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors shadow-lg">Save & Activate</button>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-gray-900/30 rounded-lg border border-soc-border/50 relative p-8 flex flex-col items-center">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isLast = idx === nodes.length - 1;
            
            return (
              <div key={node.id} className="flex flex-col items-center w-full group relative">
                
                {/* Node Box */}
                <div className={`w-full max-w-[280px] bg-soc-card border ${node.border} rounded-lg p-3 shadow-lg flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${node.bg}`}>
                      <Icon className={`w-4 h-4 ${node.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{node.type}</p>
                      <h4 className="text-sm font-medium text-white">{node.title}</h4>
                    </div>
                  </div>
                  <button className="p-1 text-gray-500 hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="w-0.5 h-10 bg-soc-border relative flex justify-center">
                    {/* Arrow head */}
                    <div className="absolute bottom-0 w-2 h-2 border-r-2 border-b-2 border-soc-border transform rotate-45 mb-1" />
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Add Node Button */}
          <div className="w-0.5 h-8 bg-soc-border border-dashed relative flex justify-center mt-2"></div>
          <button className="mt-2 w-full max-w-[280px] border-2 border-dashed border-soc-border hover:border-soc-accent rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors bg-soc-bg hover:bg-soc-card-hover">
            <Plus className="w-4 h-4" /> Add Next Step
          </button>
        </div>
        
      </div>
    </div>
  );
}
// Note: Handled the Plus icon missing import inline
import { Plus } from "lucide-react";
