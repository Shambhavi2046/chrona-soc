import { getInvestigation } from "@/lib/api";
import InvestigationHeader from "@/components/investigation/InvestigationHeader";
import ThreatAnalysisCard from "@/components/investigation/ThreatAnalysisCard";
import RecommendationList from "@/components/investigation/RecommendationList";
import { ShieldCheck, Activity } from "lucide-react";

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ alert_id: string }>;
}) {
  const resolvedParams = await params;
  // Fetch real data based on URL parameter
  const data = await getInvestigation(resolvedParams.alert_id);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* Dynamic Header section */}
      <div className="bg-soc-card/30 rounded-xl p-6 border border-soc-border glass">
        <InvestigationHeader 
          alertId={data.alert_id}
          threatType={data.threat_type}
          riskScore={data.risk_score}
          status={data.status}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Main AI Analysis (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <ThreatAnalysisCard analysis={data.investigation.analysis} />
        </div>

        {/* Right Column - Recommendations (Takes 1 column) */}
        <div className="flex flex-col h-full">
          <RecommendationList recommendations={data.investigation.recommendations} />
        </div>

      </div>

      {/* Auxiliary Info Section (Optional bottom panel to match aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
        <div className="glass-card p-4 rounded-lg flex items-center border border-soc-border">
          <Activity className="w-5 h-5 text-gray-500 mr-3" />
          <div className="text-sm">
            <span className="text-gray-400">Analysis Engine: </span>
            <span className="font-mono text-gray-300">ChronaAI-v3</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-lg flex items-center border border-soc-border">
          <ShieldCheck className="w-5 h-5 text-soc-success mr-3" />
          <div className="text-sm">
            <span className="text-gray-400">Compliance Check: </span>
            <span className="font-mono text-soc-success">Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
