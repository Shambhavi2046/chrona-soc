"use client";

import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles = {
    CRITICAL: "bg-soc-danger/20 text-soc-danger border-soc-danger/30 glow-danger",
    HIGH: "bg-soc-warning/20 text-soc-warning border-soc-warning/30",
    MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    LOW: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  
  const normSeverity = (severity || "LOW").toUpperCase();
  const style = styles[normSeverity as keyof typeof styles] || styles.LOW;
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style}`}>
      {normSeverity}
    </span>
  );
};

function timeAgo(dateParam: string | Date): string {
  if (!dateParam) return "Just now";
  const date = typeof dateParam === 'string' ? new Date(dateParam) : dateParam;
  const today = new Date();
  const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return "Just now";
  else if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  else if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''} ago`;
  else return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function IncidentTable({ incidents = [] }: { incidents?: any[] }) {
  const router = useRouter();

  if (!incidents || incidents.length === 0) {
    return (
      <div className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-soc-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-soc-warning" />
            Recent Security Incidents
          </h3>
          <Link href="/alerts">
            <button className="text-sm font-medium text-soc-accent hover:text-white transition-colors">
              View All Incidents
            </button>
          </Link>
        </div>
        <div className="p-8 text-center text-gray-400">
          No recent security incidents.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-soc-warning" />
          Recent Security Incidents
        </h3>
        <Link href="/alerts">
          <button className="text-sm font-medium text-soc-accent hover:text-white transition-colors">
            View All Incidents
          </button>
        </Link>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Threat Type</th>
              <th className="px-6 py-4 font-medium">Source</th>
              <th className="px-6 py-4 font-medium">Risk Score</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Timestamp</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {incidents.map((incident) => {
              const displayId = incident.id.split('-')[0].toUpperCase();
              return (
                <tr key={incident.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{incident.threat_type || incident.title}</div>
                    <div className="text-xs text-gray-500">ALT-{displayId}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 font-mono text-sm">{incident.source || "Unknown"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-full max-w-[4rem] bg-soc-bg rounded-full h-1.5 mr-2">
                        <div 
                          className={`h-1.5 rounded-full ${incident.risk_score > 80 ? 'bg-soc-danger' : incident.risk_score > 50 ? 'bg-soc-warning' : 'bg-soc-success'}`}
                          style={{ width: `${incident.risk_score || 0}%` }}
                        ></div>
                      </div>
                      <span className={`font-mono text-sm ${incident.risk_score > 80 ? 'text-soc-danger font-bold' : 'text-gray-400'}`}>
                        {incident.risk_score || 0}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-300 flex items-center">
                      {incident.status === 'Resolved' && <ShieldCheck className="w-4 h-4 mr-1 text-soc-success" />}
                      {incident.status === 'Blocked' && <Shield className="w-4 h-4 mr-1 text-soc-accent" />}
                      {incident.status === 'In Progress' && <ShieldAlert className="w-4 h-4 mr-1 text-soc-warning animate-pulse" />}
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{timeAgo(incident.created_at)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => router.push(`/investigations/${incident.id}`)}
                      className="px-3 py-1 bg-soc-bg border border-soc-border hover:border-soc-accent text-soc-accent text-xs font-medium rounded transition-colors"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
