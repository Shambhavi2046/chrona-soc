import { HuntEvent } from "@/types";
import { Activity } from "lucide-react";
import ClientDate from "@/components/common/ClientDate";

interface TimelineViewProps {
  events: HuntEvent[];
}

export default function TimelineView({ events }: TimelineViewProps) {
  // Sort events chronologically (oldest first for timeline flow)
  const sortedEvents = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="glass-card rounded-xl border border-soc-border p-6 h-[400px] flex flex-col">
      <div className="flex items-center gap-2 mb-6 text-white font-medium">
        <Activity className="w-5 h-5 text-soc-accent" />
        Execution Timeline
      </div>
      
      <div className="flex-1 overflow-y-auto pr-4">
        <div className="relative border-l border-soc-border/50 ml-3 space-y-6">
          {sortedEvents.map((event, idx) => (
            <div key={event.id} className="relative pl-6">
              <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                event.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                event.severity === 'High' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                event.severity === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
              }`} />
              
              <div className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-gray-500 font-mono">
                  <ClientDate date={event.timestamp} format="full" />
                </span>
                <span className="text-gray-200 font-medium">{event.description}</span>
                <div className="flex gap-3 mt-1">
                  <span className="text-xs text-soc-accent font-mono">{event.host}</span>
                  <span className="text-xs text-gray-400 font-mono">{event.mitre_tactic}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
