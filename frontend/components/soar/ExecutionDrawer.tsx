import { X, Activity, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { ExecutionLog } from "@/types";
import ClientDate from "@/components/common/ClientDate";

interface ExecutionDrawerProps {
  execution: ExecutionLog | null;
  onClose: () => void;
}

export default function ExecutionDrawer({ execution, onClose }: ExecutionDrawerProps) {
  if (!execution) return null;

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
              Execution Pipeline
            </h2>
            <p className="text-sm font-mono text-gray-500 mt-0.5">{execution.id} - {execution.playbookName}</p>
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
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            execution.status === 'Success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            execution.status === 'Failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            execution.status === 'Running' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-orange-500/10 border-orange-500/20 text-orange-400'
          }`}>
            <div className="flex items-center gap-3">
              {execution.status === 'Success' && <CheckCircle2 className="w-5 h-5" />}
              {execution.status === 'Failed' && <X className="w-5 h-5" />}
              {execution.status === 'Pending Approval' && <AlertTriangle className="w-5 h-5" />}
              <span className="font-bold">{execution.status}</span>
            </div>
            <span className="text-sm font-mono"><ClientDate date={execution.startTime} format="full" /></span>
          </div>

          {/* Stepper Timeline */}
          <div className="glass-card p-5 rounded-xl border border-soc-border">
            <h3 className="text-sm font-bold text-white mb-6">Workflow Trace</h3>
            <div className="relative border-l-2 border-soc-border ml-3 space-y-8">
              
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-soc-bg border-2 border-emerald-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Trigger Fired</h4>
                    <p className="text-xs text-gray-400 mt-1">{execution.trigger}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">00:00:00</span>
                </div>
              </div>

              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-soc-bg border-2 border-emerald-500" />
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium text-white">Extract Indicators</h4>
                    <p className="text-xs text-gray-400 mt-1">Parsed 3 IPs, 1 URL</p>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">00:00:02</span>
                </div>
              </div>

              {execution.status === 'Failed' ? (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-soc-bg border-2 border-red-500" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-red-400">Threat Intelligence Lookup</h4>
                      <p className="text-xs text-red-500 mt-1 bg-red-500/10 p-2 rounded mt-2 border border-red-500/20 font-mono">
                        Error: Timeout connecting to external API endpoint (VirusTotal).
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">00:03:12</span>
                  </div>
                </div>
              ) : execution.status === 'Pending Approval' ? (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-soc-bg border-2 border-orange-500 animate-pulse" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-orange-400">Manual Approval Gate</h4>
                      <p className="text-xs text-gray-400 mt-1">Waiting for SOC Analyst approval to proceed with Account Disable.</p>
                      <div className="flex gap-2 mt-3">
                        <button className="px-3 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors">Approve</button>
                        <button className="px-3 py-1.5 bg-soc-bg hover:bg-soc-card-hover border border-soc-border rounded text-xs font-medium text-white transition-colors">Deny</button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Pending</span>
                  </div>
                </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-emerald-400">Workflow Complete</h4>
                      <p className="text-xs text-gray-400 mt-1">Successfully closed ticket and sent notification.</p>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">00:00:45</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Raw Log Output */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Debug Logs</h3>
            <div className="bg-[#0D1117] border border-soc-border rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-gray-400 leading-relaxed">
              <div>[INFO] Workflow initialized. ID: {execution.id}</div>
              <div>[INFO] Loading nodes...</div>
              <div>[INFO] Connecting to external services.</div>
              {execution.status === 'Failed' && (
                <div className="text-red-400 mt-2">[ERROR] Network timeout occurred at node 3. Stack trace appended.</div>
              )}
              {execution.status === 'Pending Approval' && (
                <div className="text-orange-400 mt-2">[WARN] Workflow suspended. Waiting for human interaction token.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
