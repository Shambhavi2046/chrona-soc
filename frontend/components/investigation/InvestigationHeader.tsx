import Link from "next/link";
import { ArrowLeft, Download, CheckCircle, ShieldAlert } from "lucide-react";
import SeverityBadge from "@/components/alerts/SeverityBadge";

interface InvestigationHeaderProps {
  alertId: number | string;
  threatType: string;
  riskScore: number;
  status: string;
}

export default function InvestigationHeader({
  alertId,
  threatType,
  riskScore,
  status,
}: InvestigationHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <Link 
          href="/alerts" 
          className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Alerts
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            Incident Investigation
          </h1>
          <SeverityBadge score={riskScore} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-400">
          <span className="font-mono bg-soc-card px-2 py-1 rounded border border-soc-border">
            ALT-{String(alertId).padStart(4, '0')}
          </span>
          <span className="flex items-center">
            <ShieldAlert className="w-4 h-4 mr-1 text-gray-500" />
            Threat: <strong className="text-white ml-1">{threatType}</strong>
          </span>
          <span className="flex items-center capitalize">
            Status: <strong className="text-white ml-1">{status}</strong>
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <button className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
        {status.toLowerCase() !== 'resolved' && (
          <button className="flex items-center px-4 py-2 bg-soc-success/20 hover:bg-soc-success/30 border border-soc-success/50 text-soc-success text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Resolved
          </button>
        )}
      </div>
    </div>
  );
}
