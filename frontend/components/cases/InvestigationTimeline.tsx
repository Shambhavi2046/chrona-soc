"use client";

import { TimelineEvent } from "@/types";
import { motion } from "framer-motion";
import { Activity, MessageSquare, Paperclip, AlertCircle, Bot, ShieldAlert } from "lucide-react";
import ClientDate from "@/components/common/ClientDate";
import { useRouter, useParams } from "next/navigation";

interface InvestigationTimelineProps {
  timeline: TimelineEvent[];
}

export default function InvestigationTimeline({ timeline }: InvestigationTimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'comment':
      case 'note': return <MessageSquare className="w-4 h-4 text-soc-accent" />;
      case 'evidence_added': return <Paperclip className="w-4 h-4 text-soc-warning" />;
      case 'status_change': return <Activity className="w-4 h-4 text-soc-success" />;
      case 'ai_summary': return <Bot className="w-4 h-4 text-purple-400" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-soc-danger" />;
      case 'containment':
      case 'recovery': return <ShieldAlert className="w-4 h-4 text-soc-success" />;
      case 'closure': return <Activity className="w-4 h-4 text-gray-500" />;
      case 'assignment': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'decision': return <Activity className="w-4 h-4 text-orange-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEventBadge = (type: string) => {
    const formatted = type.replace('_', ' ');
    return (
      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-soc-bg border border-soc-border text-gray-400">
        {formatted}
      </span>
    );
  };

  const params = useParams();
  const router = useRouter();

  const handleAddEvent = async () => { console.log("PARAMS:", params); 
    const content = window.prompt("Enter event note/comment:");
    if (content && content.trim() && params?.caseId) {
      try {
        const { addCaseComment } = await import("@/services/cases");
        await addCaseComment(params.caseId as string, content.trim());
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Failed to add event");
      }
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Investigation Timeline</h3>
        <button 
          onClick={handleAddEvent}
          className="px-3 py-1 bg-soc-accent hover:bg-soc-accent/80 text-white text-xs font-medium rounded transition-colors"
        >
          + Add Event
        </button>
      </div>
      
      <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-soc-border before:to-transparent">
        {timeline.map((event, index) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-soc-bg bg-soc-card shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {getEventIcon(event.event_type)}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-4 rounded-lg border border-soc-border hover:border-soc-accent/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-200">{event.author}</span>
                  {getEventBadge(event.event_type)}
                </div>
                <time className="text-xs font-mono text-gray-500">
                  <ClientDate date={event.created_at} format="time" />
                </time>
              </div>
              <div className="text-sm text-gray-400 whitespace-pre-wrap bg-soc-card/30 p-3 rounded border border-soc-border/50">
                {event.content}
              </div>
            </div>
          </motion.div>
        ))}
        {timeline.length === 0 && (
          <p className="text-gray-500 text-center text-sm italic py-4">No events in timeline.</p>
        )}
      </div>
    </div>
  );
}
