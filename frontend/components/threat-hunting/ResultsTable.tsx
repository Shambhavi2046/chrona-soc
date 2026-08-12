import { ChevronRight, ShieldAlert, ShieldCheck, Shield } from "lucide-react";
import { HuntEvent } from "@/types";
import ClientDate from "@/components/common/ClientDate";

interface ResultsTableProps {
  events: HuntEvent[];
  onRowClick: (event: HuntEvent) => void;
}

export default function ResultsTable({ events, onRowClick }: ResultsTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-4 border-b border-soc-border flex items-center justify-between">
        <h3 className="font-semibold text-soc-text-primary flex items-center">
          Hunting Results
        </h3>
        <span className="text-sm font-medium text-soc-text-secondary">
          Showing {events.length} events
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-soc-text-secondary text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Timestamp</th>
              <th className="px-6 py-3 font-medium">Severity</th>
              <th className="px-6 py-3 font-medium">Host / User</th>
              <th className="px-6 py-3 font-medium">MITRE Mapping</th>
              <th className="px-6 py-3 font-medium">Description</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {events.map((event) => (
              <tr 
                key={event.id} 
                className="hover:bg-soc-card-hover transition-colors group cursor-pointer"
                onClick={() => onRowClick(event)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-xs text-soc-text-secondary">
                  <ClientDate date={event.timestamp} format="full" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                    event.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    event.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    event.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {event.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-soc-text-primary text-sm">{event.host}</div>
                  <div className="text-xs text-soc-text-muted">{event.user}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs text-soc-text-secondary font-medium">{event.mitre_tactic}</div>
                  <div className="text-xs text-soc-text-muted font-mono mt-0.5">{event.mitre_technique}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-soc-text-secondary">{event.description}</div>
                  {event.ioc_match && (
                    <div className="text-xs text-soc-accent mt-1 font-mono truncate max-w-[200px]">
                      Match: {event.ioc_match}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-soc-text-secondary flex items-center capitalize">
                    {event.status === 'Resolved' && <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-soc-success" />}
                    {event.status === 'Open' && <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-red-400" />}
                    {event.status === 'Investigating' && <Shield className="w-3.5 h-3.5 mr-1.5 text-soc-warning animate-pulse" />}
                    {event.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronRight className="w-5 h-5 text-soc-text-muted group-hover:text-soc-text-primary transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
