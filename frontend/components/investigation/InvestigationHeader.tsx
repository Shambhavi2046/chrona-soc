"use client";

import Link from "next/link";
import { ArrowLeft, Download, CheckCircle, ShieldAlert, Loader2 } from "lucide-react";
import SeverityBadge from "@/components/alerts/SeverityBadge";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateInvestigationStatus } from "@/services/investigations";
import { getTemplates, generateReport, downloadReportPdf } from "@/services/reports";

interface InvestigationHeaderProps {
  investigationId?: string;
  alertId: number | string;
  threatType: string;
  riskScore: number;
  status: string;
}

export default function InvestigationHeader({
  investigationId,
  alertId,
  threatType,
  riskScore,
  status,
}: InvestigationHeaderProps) {
  const router = useRouter();
  const [isResolving, setIsResolving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleResolve = async () => {
    if (!investigationId) return;
    try {
      setIsResolving(true);
      await updateInvestigationStatus(investigationId, "Resolved");
      router.refresh(); // Refresh the page to reflect the new status
    } catch (e) {
      console.error("Failed to mark as resolved", e);
    } finally {
      setIsResolving(false);
    }
  };

  const handleExport = async () => {
    if (!investigationId) return;
    try {
      setIsExporting(true);
      const templates = await getTemplates().catch(() => []);
      
      const payload: any = {
        name: `Investigation Report - ALT-${String(alertId).padStart(4, '0')}`,
        source_type: "Investigation",
        source_id: investigationId,
      };
      if (templates && templates.length > 0) {
        payload.template_id = templates[0].id;
      }
      
      const report = await generateReport(payload);
      await downloadReportPdf(report.id);
    } catch (e: any) {
      console.error("Failed to export report", e);
      alert(e.message || "Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div>
        <Link 
          href="/alerts" 
          className="inline-flex items-center text-sm font-medium text-soc-text-secondary hover:text-soc-text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Alerts
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-soc-text-primary tracking-tight flex items-center">
            Incident Investigation
          </h1>
          <SeverityBadge score={riskScore} />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-soc-text-secondary">
          <span className="font-mono bg-soc-card px-2 py-1 rounded border border-soc-border">
            ALT-{String(alertId).padStart(4, '0')}
          </span>
          <span className="flex items-center">
            <ShieldAlert className="w-4 h-4 mr-1 text-soc-text-muted" />
            Threat: <strong className="text-soc-text-primary ml-1">{threatType}</strong>
          </span>
          <span className="flex items-center capitalize">
            Status: <strong className="text-soc-text-primary ml-1">{status}</strong>
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <button 
          onClick={handleExport}
          disabled={isExporting || !investigationId}
          className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-soc-text-primary text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          {isExporting ? "Exporting..." : "Export Report"}
        </button>
        {status.toLowerCase() !== 'resolved' && (
          <button 
            onClick={handleResolve}
            disabled={isResolving || !investigationId}
            className="flex items-center px-4 py-2 bg-soc-success/20 hover:bg-soc-success/30 border border-soc-success/50 text-soc-success text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {isResolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            {isResolving ? "Resolving..." : "Mark as Resolved"}
          </button>
        )}
      </div>
    </div>
  );
}
