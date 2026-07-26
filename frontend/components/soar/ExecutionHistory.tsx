import { Activity, ChevronRight, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { ExecutionLog } from "@/types";
import ClientDate from "@/components/common/ClientDate";

interface ExecutionHistoryProps {
  executions: ExecutionLog[];
  onRowClick: (exec: ExecutionLog) => void;
}

export default function ExecutionHistory({ executions, onRowClick }: ExecutionHistoryProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-soc-border flex items-center justify-between bg-soc-bg">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-soc-accent" />
          Execution History
        </h3>
        <span className="text-sm font-medium text-gray-400">
          Showing {executions.length} runs
        </span>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Playbook</th>
              <th className="px-6 py-3 font-medium">Trigger</th>
              <th className="px-6 py-3 font-medium">Start Time</th>
              <th className="px-6 py-3 font-medium">Duration</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {executions.map((exec) => (
              <tr 
                key={exec.id} 
                className="hover:bg-soc-card-hover transition-colors group cursor-pointer"
                onClick={() => onRowClick(exec)}
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-white text-sm">{exec.playbookName}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{exec.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                  <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-gray-300">
                    {exec.trigger}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                  <ClientDate date={exec.startTime} format="full" />
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 font-mono">
                  {exec.duration}
                </td>
                <td className="px-6 py-4">
                  <span className={`flex items-center text-xs font-medium ${
                    exec.status === 'Success' ? 'text-emerald-400' :
                    exec.status === 'Failed' ? 'text-red-400' : 
                    exec.status === 'Running' ? 'text-blue-400' :
                    'text-orange-400'
                  }`}>
                    {exec.status === 'Success' && <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                    {exec.status === 'Failed' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                    {exec.status === 'Running' && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    {exec.status === 'Pending Approval' && <Clock className="w-3.5 h-3.5 mr-1.5" />}
                    {exec.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {exec.initiatedBy}
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
