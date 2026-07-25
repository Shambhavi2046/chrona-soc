import Link from "next/link";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from "lucide-react";
import { Alert } from "@/lib/api";
import SeverityBadge from "./SeverityBadge";

interface AlertTableProps {
  alerts: Alert[];
}

export default function AlertTable({ alerts }: AlertTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-soc-warning" />
          Detected Alerts
        </h3>
        <span className="text-sm font-medium text-gray-400">
          Showing {alerts.length} alerts
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Alert ID</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Threat Type</th>
              <th className="px-6 py-4 font-medium">Risk Score</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Created Time</th>
              <th className="px-6 py-4 font-medium">Log ID</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {alerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                  No alerts detected. All clear.
                </td>
              </tr>
            ) : (
              alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-sm">
                    ALT-{alert.id.toString().padStart(4, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge score={alert.risk_score} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{alert.threat_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full max-w-[4rem] bg-soc-bg rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${alert.risk_score > 80 ? 'bg-soc-danger' : alert.risk_score > 50 ? 'bg-soc-warning' : 'bg-soc-success'}`}
                          style={{ width: `${alert.risk_score}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono text-sm ${alert.risk_score > 80 ? 'text-soc-danger font-bold' : 'text-gray-400'}`}>
                        {alert.risk_score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300 flex items-center capitalize">
                      {alert.status.toLowerCase() === 'resolved' && <ShieldCheck className="w-4 h-4 mr-1 text-soc-success" />}
                      {alert.status.toLowerCase() === 'blocked' && <Shield className="w-4 h-4 mr-1 text-soc-accent" />}
                      {(alert.status.toLowerCase() === 'open' || alert.status.toLowerCase() === 'investigating') && <ShieldAlert className="w-4 h-4 mr-1 text-soc-warning animate-pulse" />}
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(alert.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    LOG-{alert.log_id}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/investigations/${alert.id}`}>
                      <button className="px-3 py-1 bg-soc-bg border border-soc-border hover:border-soc-accent text-soc-accent text-xs font-medium rounded transition-colors group-hover:bg-soc-accent/10">
                        Investigate
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
