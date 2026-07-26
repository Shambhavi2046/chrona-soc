import { RiskAssessment } from "@/types";
import { AlertTriangle, TrendingUp, ShieldAlert, Target, Shield, Crosshair } from "lucide-react";

interface RiskAssessmentCardProps {
  risk: RiskAssessment | null;
}

export default function RiskAssessmentCard({ risk }: RiskAssessmentCardProps) {
  if (!risk) return null;

  const getMetricColor = (val: string) => {
    switch(val.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-soc-danger';
      case 'possible':
      case 'medium': return 'text-soc-warning';
      default: return 'text-soc-success';
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <AlertTriangle className="w-5 h-5 text-soc-warning mr-2" />
        <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-4">
        
        <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col justify-center items-center text-center">
          <ShieldAlert className={`w-8 h-8 mb-2 ${getMetricColor(risk.overall_risk)}`} />
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Overall Risk</span>
          <span className={`text-lg font-bold ${getMetricColor(risk.overall_risk)}`}>{risk.overall_risk}</span>
        </div>

        <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col justify-center items-center text-center">
          <TrendingUp className={`w-8 h-8 mb-2 ${getMetricColor(risk.likelihood)}`} />
          <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Likelihood</span>
          <span className={`text-lg font-bold ${getMetricColor(risk.likelihood)}`}>{risk.likelihood}</span>
        </div>

        <div className="col-span-2 grid grid-cols-3 gap-2 mt-2">
          <div className="bg-soc-card border border-soc-border/50 rounded flex flex-col p-3">
            <Target className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase font-mono">Asset Exposure</span>
            <span className={`text-xs font-bold ${getMetricColor(risk.asset_exposure)}`}>{risk.asset_exposure}</span>
          </div>
          <div className="bg-soc-card border border-soc-border/50 rounded flex flex-col p-3">
            <Shield className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase font-mono">Threat Confidence</span>
            <span className={`text-xs font-bold ${getMetricColor(risk.threat_confidence)}`}>{risk.threat_confidence}</span>
          </div>
          <div className="bg-soc-card border border-soc-border/50 rounded flex flex-col p-3">
            <Crosshair className="w-4 h-4 text-gray-400 mb-1" />
            <span className="text-[9px] text-gray-500 uppercase font-mono">Complexity</span>
            <span className={`text-xs font-bold ${getMetricColor(risk.attack_complexity)}`}>{risk.attack_complexity}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
