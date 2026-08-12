import { ClipboardList, Download, Filter } from "lucide-react";
import { AuditLogEntry } from "@/types";
import ClientDate from "@/components/common/ClientDate";

interface AuditLogProps {
  logs: AuditLogEntry[];
}

export default function AuditLog({ logs }: AuditLogProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-soc-border flex items-center justify-between bg-soc-bg">
        <h3 className="font-semibold text-soc-text-primary flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-soc-accent" />
          System Audit Log
        </h3>
        <div className="flex gap-2">
          <button className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary bg-soc-card hover:bg-soc-border rounded transition-colors tooltip-trigger" title="Filter">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary bg-soc-card hover:bg-soc-border rounded transition-colors tooltip-trigger" title="Export CSV">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-soc-text-secondary text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Action</th>
              <th className="px-6 py-3 font-medium">Resource</th>
              <th className="px-6 py-3 font-medium">IP Address</th>
              <th className="px-6 py-3 font-medium">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-soc-card-hover transition-colors group">
                <td className="px-6 py-4 text-xs text-soc-text-secondary whitespace-nowrap">
                  <ClientDate date={log.timestamp} format="full" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-soc-text-primary">{log.user}</div>
                </td>
                <td className="px-6 py-4 text-sm text-soc-text-secondary">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-soc-text-secondary">
                  {log.resource}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-soc-text-secondary">
                  {log.ip}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                    log.result === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
