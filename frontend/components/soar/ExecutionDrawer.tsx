import { useState, useEffect } from "react";
import { X, Activity, Play, CheckCircle2, AlertTriangle, PauseCircle, StopCircle, RefreshCw } from "lucide-react";
import { ExecutionLog } from "@/types";
import ClientDate from "@/components/common/ClientDate";
import { getExecution, pauseExecution, resumeExecution, cancelExecution } from "@/services/soar";

interface ExecutionDrawerProps {
  execution: ExecutionLog | null;
  onClose: () => void;
}

export default function ExecutionDrawer({ execution: initialExecution, onClose }: ExecutionDrawerProps) {
  const [execution, setExecution] = useState<ExecutionLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setExecution(initialExecution);
  }, [initialExecution]);

  useEffect(() => {
    if (!execution || !['Running', 'Paused', 'Pending'].includes(execution.status as string)) return;

    const interval = setInterval(async () => {
      try {
        const updated = await getExecution(execution.id);
        setExecution(updated);
      } catch (e) {
        console.error(e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [execution?.id, execution?.status]);

  const handleControl = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!execution) return;
    setError(null);
    try {
      let res;
      if (action === 'pause') res = await pauseExecution(execution.id);
      else if (action === 'resume') res = await resumeExecution(execution.id);
      else if (action === 'cancel') res = await cancelExecution(execution.id);

      if (res) setExecution(res);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} execution`);
      try {
        const fresh = await getExecution(execution.id);
        setExecution(fresh);
      } catch (e) {
        console.error("Failed to refresh execution status after error", e);
      }
    }
  };

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
            <h2 className="text-lg font-bold text-soc-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-soc-accent" />
              Execution Pipeline
            </h2>
            <p className="text-sm font-mono text-soc-text-muted mt-0.5">{execution.id} - {execution.playbookName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-soc-text-secondary hover:text-soc-text-primary hover:bg-soc-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            (execution.status as string) === 'Success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
            (execution.status as string) === 'Failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            (execution.status as string) === 'Cancelled' ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' :
            ['Running', 'Pending'].includes(execution.status as string) ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
            'bg-orange-500/10 border-orange-500/20 text-orange-400'
          }`}>
            <div className="flex items-center gap-3">
              {(execution.status as string) === 'Success' && <CheckCircle2 className="w-5 h-5" />}
              {['Failed', 'Cancelled'].includes(execution.status as string) && <X className="w-5 h-5" />}
              {(execution.status as string) === 'Paused' && <PauseCircle className="w-5 h-5" />}
              {['Running', 'Pending'].includes(execution.status as string) && <RefreshCw className="w-5 h-5 animate-spin" />}
              <span className="font-bold">{execution.status}</span>
              <span className="text-sm font-mono ml-4 text-soc-text-secondary border-l border-gray-600 pl-4"><ClientDate date={execution.startTime} format="full" /></span>
            </div>
            <div className="flex items-center gap-2">
              {['Running', 'Pending'].includes(execution.status as string) && (
                <>
                  <button onClick={() => handleControl('pause')} className="px-3 py-1.5 bg-soc-bg border border-soc-border hover:bg-soc-card-hover rounded text-xs font-medium text-soc-text-primary flex items-center gap-1"><PauseCircle className="w-3.5 h-3.5" /> Pause</button>
                  <button onClick={() => handleControl('cancel')} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded text-xs font-medium text-red-400 flex items-center gap-1"><StopCircle className="w-3.5 h-3.5" /> Cancel</button>
                </>
              )}
              {(execution.status as string) === 'Paused' && (
                <>
                  <button onClick={() => handleControl('resume')} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 rounded text-xs font-medium text-emerald-400 flex items-center gap-1"><Play className="w-3.5 h-3.5" /> Resume</button>
                  <button onClick={() => handleControl('cancel')} className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 rounded text-xs font-medium text-red-400 flex items-center gap-1"><StopCircle className="w-3.5 h-3.5" /> Cancel</button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Stepper Timeline */}
          <div className="glass-card p-5 rounded-xl border border-soc-border">
            <h3 className="text-sm font-bold text-soc-text-primary mb-6">Workflow Trace</h3>
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
                          <h4 className={`text-sm font-medium ${isSuccess ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-white'} flex items-center gap-2`}>
                            {log.step}
                            {log.output?.status === "simulated" && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">SIMULATED ACTION</span>
                            )}
                          </h4>
                          {log.message && (
                            <p className="text-xs text-soc-text-secondary mt-1 break-words">{log.message}</p>
                          )}
                          {log.output && Object.keys(log.output).length > 0 && (
                            <div className="mt-2 bg-[#0D1117] border border-soc-border rounded p-2 overflow-x-auto">
                              <pre className="text-[10px] text-soc-text-secondary font-mono">
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
                        <span className="text-xs text-soc-text-muted font-mono whitespace-nowrap ml-4">
                          {log.time ? new Date(log.time).toLocaleTimeString() : '--:--'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-soc-text-muted text-sm">No execution logs available.</div>
              )}
            </div>
          </div>

          {/* Raw Log Output */}
          <div>
            <h3 className="text-sm font-bold text-soc-text-primary mb-3">Debug Logs (Raw)</h3>
            <div className="bg-[#0D1117] border border-soc-border rounded-xl p-4 h-48 overflow-y-auto font-mono text-[11px] text-soc-text-secondary leading-relaxed whitespace-pre">
              {execution.execution_logs ? JSON.stringify(execution.execution_logs, null, 2) : "No raw logs available."}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
