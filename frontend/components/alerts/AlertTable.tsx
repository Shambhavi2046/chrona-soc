"use client";

import Link from "next/link";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from "lucide-react";
import { Alert } from "@/types";
import SeverityBadge from "./SeverityBadge";
import ClientDate from "@/components/common/ClientDate";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface AlertTableProps {
  alerts: Alert[];
}

export default function AlertTable({ alerts }: AlertTableProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const filteredAlerts = useMemo(() => {
    if (!query) return alerts;
    return alerts.filter(alert => {
      const q = query.toLowerCase();
      
      const alertId = alert.id.split('-')[0].toLowerCase();
      const incMatch = `inc-${alertId}`.includes(q) || `alt-${alertId}`.includes(q) || alertId.includes(q);
      
      const threatMatch = alert.threat_type?.toLowerCase().includes(q);
      const sourceMatch = (alert as any).source?.toLowerCase().includes(q);
      const logMatch = alert.log_id?.toLowerCase().includes(q);
      const titleMatch = (alert as any).title?.toLowerCase().includes(q);
      const rawLogMatch = (alert as any).raw_log ? JSON.stringify((alert as any).raw_log).toLowerCase().includes(q) : false;
      
      return incMatch || threatMatch || sourceMatch || logMatch || titleMatch || rawLogMatch;
    });
  }, [alerts, query]);

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-soc-text-primary flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-soc-warning" />
          Detected Alerts
        </h3>
        <span className="text-sm font-medium text-soc-text-secondary">
          Showing {filteredAlerts.length} {filteredAlerts.length === 1 ? 'alert' : 'alerts'}
          {query && " (filtered)"}
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-soc-text-secondary text-xs uppercase tracking-wider">
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
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-soc-text-muted">
                  {query ? "No alerts match your search." : "No alerts detected. All clear."}
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-soc-text-secondary font-mono text-sm">
                    {alert.id.toString().split('-')[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge score={alert.risk_score} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-soc-text-primary">{alert.threat_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full max-w-[4rem] bg-soc-bg rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${alert.risk_score > 80 ? 'bg-soc-danger' : alert.risk_score > 50 ? 'bg-soc-warning' : 'bg-soc-success'}`}
                          style={{ width: `${alert.risk_score}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono text-sm ${alert.risk_score > 80 ? 'text-soc-danger font-bold' : 'text-soc-text-secondary'}`}>
                        {alert.risk_score}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-soc-text-secondary flex items-center capitalize">
                      {alert.status.toLowerCase() === 'resolved' && <ShieldCheck className="w-4 h-4 mr-1 text-soc-success" />}
                      {alert.status.toLowerCase() === 'blocked' && <Shield className="w-4 h-4 mr-1 text-soc-accent" />}
                      {(alert.status.toLowerCase() === 'open' || alert.status.toLowerCase() === 'investigating') && <ShieldAlert className="w-4 h-4 mr-1 text-soc-warning animate-pulse" />}
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-soc-text-secondary whitespace-nowrap">
                    <ClientDate date={alert.created_at} format="full" />
                  </td>
                  <td className="px-6 py-4 text-sm text-soc-text-muted font-mono">
                    {alert.log_id ? `LOG-${alert.log_id}` : `SYS`}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/investigations/${alert.id}`}
                      className="inline-block px-3 py-1 bg-soc-bg border border-soc-border hover:border-soc-accent text-soc-accent text-xs font-medium rounded transition-colors group-hover:bg-soc-accent/10"
                    >
                      Investigate
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
