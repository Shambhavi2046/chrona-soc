import { Cpu, ChevronRight, AlertOctagon, Target } from "lucide-react";

interface TopThreat {
  title: string;
  source: string;
  risk_score: number;
}

interface RiskIndicatorProps {
  topThreat?: TopThreat | null;
}

export default function RiskIndicator({ topThreat }: RiskIndicatorProps) {
  // Use dynamic risk score or fallback
  const riskScore = topThreat?.risk_score || 85;

  return (
    <div className="glass-card rounded-xl p-6 relative overflow-hidden flex flex-col h-full border-t-2 border-t-soc-accent">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 text-soc-accent/5 pointer-events-none">
        <Cpu className="w-64 h-64" />
      </div>

      <div className="relative z-10 flex items-center mb-6">
        <div className="p-2 bg-soc-accent/20 rounded-lg mr-3 glow-accent">
          <Cpu className="w-6 h-6 text-soc-accent" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Threat Intelligence Engine</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10 flex-1">
        <div className="bg-soc-bg/50 p-4 rounded-lg border border-soc-border">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
            Detected Threat
          </span>
          <div className="flex items-center text-soc-danger font-bold">
            <AlertOctagon className="w-4 h-4 mr-2" />
            <span className="truncate">{topThreat?.title || "Analyzing network traffic..."}</span>
          </div>
        </div>

        <div className="bg-soc-bg/50 p-4 rounded-lg border border-soc-border flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
              AI Confidence
            </span>
            <div className="text-2xl font-bold text-white">{riskScore}/100</div>
          </div>
          {/* Circular progress representation */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-soc-border"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-soc-danger animate-[dash_2s_ease-out_forwards]"
                strokeWidth="3"
                strokeDasharray={`${riskScore}, 100`}
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-soc-accent/10 border border-soc-accent/20 rounded-lg p-4">
        <div className="flex items-center text-sm font-semibold text-soc-accent mb-2">
          <Target className="w-4 h-4 mr-2" />
          Recommended Actions
        </div>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-center group cursor-pointer hover:text-white transition-colors">
            <span className="w-1.5 h-1.5 bg-soc-accent rounded-full mr-2"></span>
            Investigate source IP activity
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-soc-accent" />
          </li>
          <li className="flex items-center group cursor-pointer hover:text-white transition-colors">
            <span className="w-1.5 h-1.5 bg-soc-accent rounded-full mr-2"></span>
            Isolate affected authentication server
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-soc-accent" />
          </li>
        </ul>
      </div>
    </div>
  );
}
