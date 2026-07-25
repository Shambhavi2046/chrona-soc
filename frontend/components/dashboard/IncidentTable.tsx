import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from "lucide-react";

const recentIncidents = [
  {
    id: "INC-2045",
    severity: "CRITICAL",
    type: "Brute Force Attack",
    source: "Auth Server (192.168.1.45)",
    riskScore: 92,
    status: "Investigating",
    timestamp: "2 mins ago",
  },
  {
    id: "INC-2044",
    severity: "HIGH",
    type: "Data Exfiltration Attempt",
    source: "DB-Cluster-02",
    riskScore: 85,
    status: "Blocked",
    timestamp: "15 mins ago",
  },
  {
    id: "INC-2043",
    severity: "MEDIUM",
    type: "Suspicious Login",
    source: "VPN Gateway (Tokyo)",
    riskScore: 65,
    status: "Resolved",
    timestamp: "1 hour ago",
  },
  {
    id: "INC-2042",
    severity: "LOW",
    type: "Port Scan Detected",
    source: "External IP 104.28.x.x",
    riskScore: 30,
    status: "Resolved",
    timestamp: "2 hours ago",
  },
];

const SeverityBadge = ({ severity }: { severity: string }) => {
  const styles = {
    CRITICAL: "bg-soc-danger/20 text-soc-danger border-soc-danger/30 glow-danger",
    HIGH: "bg-soc-warning/20 text-soc-warning border-soc-warning/30",
    MEDIUM: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    LOW: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };
  
  const style = styles[severity as keyof typeof styles] || styles.LOW;
  
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${style}`}>
      {severity}
    </span>
  );
};

export default function IncidentTable() {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-soc-warning" />
          Recent Security Incidents
        </h3>
        <button className="text-sm font-medium text-soc-accent hover:text-white transition-colors">
          View All Incidents
        </button>
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
            {recentIncidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <SeverityBadge severity={incident.severity} />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{incident.type}</div>
                  <div className="text-xs text-gray-500">{incident.id}</div>
                </td>
                <td className="px-6 py-4 text-gray-300 font-mono text-sm">{incident.source}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-full max-w-[4rem] bg-soc-bg rounded-full h-1.5 mr-2">
                      <div 
                        className={`h-1.5 rounded-full ${incident.riskScore > 80 ? 'bg-soc-danger' : incident.riskScore > 50 ? 'bg-soc-warning' : 'bg-soc-success'}`}
                        style={{ width: `${incident.riskScore}%` }}
                      ></div>
                    </div>
                    <span className={`font-mono text-sm ${incident.riskScore > 80 ? 'text-soc-danger font-bold' : 'text-gray-400'}`}>
                      {incident.riskScore}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-300 flex items-center">
                    {incident.status === 'Resolved' && <ShieldCheck className="w-4 h-4 mr-1 text-soc-success" />}
                    {incident.status === 'Blocked' && <Shield className="w-4 h-4 mr-1 text-soc-accent" />}
                    {incident.status === 'Investigating' && <ShieldAlert className="w-4 h-4 mr-1 text-soc-warning animate-pulse" />}
                    {incident.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{incident.timestamp}</td>
                <td className="px-6 py-4 text-right">
                  <button className="px-3 py-1 bg-soc-bg border border-soc-border hover:border-soc-accent text-soc-accent text-xs font-medium rounded transition-colors">
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
