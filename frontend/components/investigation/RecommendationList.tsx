import { Target, CheckSquare } from "lucide-react";

interface RecommendationListProps {
  recommendations: string[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-soc-success/20 rounded-lg mr-3 border border-soc-success/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <Target className="w-5 h-5 text-soc-success" />
        </div>
        <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
      </div>

      <div className="flex-1 space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-gray-400 italic">No recommendations provided.</p>
        ) : (
          recommendations.map((rec, index) => (
            <div 
              key={index} 
              className="flex items-start p-4 rounded-lg bg-soc-bg border border-soc-border hover:border-soc-success/50 transition-colors duration-300 group cursor-pointer"
            >
              <div className="flex-shrink-0 mt-0.5">
                <CheckSquare className="w-5 h-5 text-gray-500 group-hover:text-soc-success transition-colors" />
              </div>
              <div className="ml-3 text-sm text-gray-300 group-hover:text-white transition-colors font-medium">
                {rec}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
