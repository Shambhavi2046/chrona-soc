import { Activity, Radio, AlertTriangle } from "lucide-react";

interface ActivityFeedItem {
  id: string;
  source: string;
  message: string;
  time: string;
  isHighPriority: boolean;
}

interface ThreatActivityCardProps {
  feed: ActivityFeedItem[];
}

export default function ThreatActivityCard({ feed }: ThreatActivityCardProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border-t-2 border-t-soc-warning">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Radio className="w-5 h-5 mr-2 text-soc-warning animate-pulse" />
          Global Threat Activity
        </h3>
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {feed.map((item, index) => (
            <div key={item.id} className="relative pl-6 border-l border-soc-border group">
              <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-soc-card ${
                item.isHighPriority ? 'bg-soc-danger glow-danger' : 'bg-soc-accent'
              }`} />
              <div className="flex flex-col">
                <span className="text-xs font-mono text-gray-500 mb-1">{item.time}</span>
                <span className="text-sm font-medium text-soc-accent mb-0.5">{item.source}</span>
                <p className={`text-sm ${item.isHighPriority ? 'text-gray-200' : 'text-gray-400'}`}>
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
