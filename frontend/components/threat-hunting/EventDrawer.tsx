import { X, ExternalLink, Activity, Target, Shield, Clock } from "lucide-react";
import { HuntEvent } from "@/types";
import ClientDate from "@/components/common/ClientDate";

interface EventDrawerProps {
  event: HuntEvent | null;
  onClose: () => void;
}

export default function EventDrawer({ event, onClose }: EventDrawerProps) {
  if (!event) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-soc-bg border-l border-soc-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-soc-border bg-soc-card flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-soc-accent" />
              Event Details
            </h2>
            <p className="text-sm font-mono text-gray-500 mt-0.5">{event.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-soc-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4 rounded-xl border border-soc-border">
              <p className="text-xs text-gray-500 mb-1">Timestamp</p>
              <p className="text-sm text-gray-200"><ClientDate date={event.timestamp} format="full" /></p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-soc-border">
              <p className="text-xs text-gray-500 mb-1">Severity</p>
              <p className={`text-sm font-medium ${
                event.severity === 'Critical' ? 'text-red-400' :
                event.severity === 'High' ? 'text-orange-400' :
                event.severity === 'Medium' ? 'text-yellow-400' : 'text-blue-400'
              }`}>{event.severity}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-soc-border">
              <p className="text-xs text-gray-500 mb-1">Host</p>
              <p className="text-sm font-mono text-gray-200">{event.host}</p>
            </div>
            <div className="glass-card p-4 rounded-xl border border-soc-border">
              <p className="text-xs text-gray-500 mb-1">User</p>
              <p className="text-sm font-mono text-gray-200">{event.user}</p>
            </div>
          </div>

          {/* MITRE & IOC */}
          <div className="glass-card p-5 rounded-xl border border-soc-border">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-soc-accent" />
              Threat Intelligence
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">MITRE ATT&CK Mapping</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-xs text-gray-300">
                    {event.mitre_tactic}
                  </span>
                  <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-xs font-mono text-soc-accent">
                    {event.mitre_technique}
                  </span>
                </div>
              </div>
              {event.ioc_match && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">IOC Match</p>
                  <p className="text-sm font-mono text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                    {event.ioc_match}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Raw Log */}
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-soc-accent" />
              Raw Event Payload
            </h3>
            <div className="bg-[#0D1117] border border-soc-border rounded-xl p-4 overflow-x-auto relative group">
              <pre className="text-xs font-mono text-gray-300 leading-relaxed">
                {JSON.stringify(JSON.parse(event.raw_log), null, 2)}
              </pre>
              <button className="absolute top-2 right-2 px-3 py-1 bg-soc-card border border-soc-border hover:border-gray-500 rounded text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-all">
                Copy JSON
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-soc-border bg-soc-card flex gap-3">
          <button className="flex-1 py-2.5 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            Create Investigation
          </button>
          <button className="flex-1 py-2.5 bg-soc-bg hover:bg-soc-card-hover border border-soc-border rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
            Ask Copilot <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
      </div>
    </>
  );
}
