import { BrainCircuit } from "lucide-react";

interface ThreatAnalysisCardProps {
  analysis: string;
}

export default function ThreatAnalysisCard({ analysis }: ThreatAnalysisCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 relative overflow-hidden flex flex-col h-full border-t-2 border-t-soc-accent group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 text-soc-accent/5 pointer-events-none group-hover:text-soc-accent/10 transition-colors duration-500">
        <BrainCircuit className="w-48 h-48" />
      </div>

      <div className="relative z-10 flex items-center mb-6">
        <div className="p-2 bg-soc-accent/20 rounded-lg mr-3 glow-accent">
          <BrainCircuit className="w-6 h-6 text-soc-accent animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-white">AI Threat Analysis</h3>
      </div>

      <div className="relative z-10 text-gray-300 leading-relaxed space-y-4 font-medium">
        {analysis.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
