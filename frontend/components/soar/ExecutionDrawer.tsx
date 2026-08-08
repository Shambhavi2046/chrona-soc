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

              {execution.execution_logs && execution.execution_logs.length > 0 ? (
                execution.execution_logs.map((log: any, idx: number) => {
                  const isSuccess = log.status === "Success";
                  const isFailed = log.status === "Failed";

                  return (
                    <div key={idx} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-soc-bg border-2 ${isSuccess ? 'border-emerald-500' : isFailed ? 'border-red-500' : 'border-blue-500'}`} />
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4 min-w-0">
                          <h4 className={`text-sm font-medium ${isSuccess ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-white'}`}>{log.step}</h4>
                          {log.message && (
                            <p className="text-xs text-gray-400 mt-1 break-words">{log.message}</p>
                          )}
                          {log.output && Object.keys(log.output).length > 0 && (
                            <div className="mt-2 bg-[#0D1117] border border-soc-border rounded p-2 overflow-x-auto">
                              <pre className="text-[10px] text-gray-400 font-mono">
                                {JSON.stringify(log.output, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.error && (
                            <p className="text-xs text-red-500 mt-1 bg-red-500/10 p-2 rounded border border-red-500/20 font-mono break-words">
                              Error: {log.error}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 font-mono whitespace-nowrap ml-4">
                          {log.time ? new Date(log.time).toLocaleTimeString() : '--:--'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm">No execution logs available.</div>
              )}
            </div>
          </div>

          {/* Raw Log Output */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Debug Logs (Raw)</h3>
            <div className="bg-[#0D1117] border border-soc-border rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-gray-400 leading-relaxed whitespace-pre">
              {execution.execution_logs ? JSON.stringify(execution.execution_logs, null, 2) : "No raw logs available."}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
