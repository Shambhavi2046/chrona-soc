"use client";

import { CaseDetail } from "@/types";
import { Clock, ShieldAlert, CheckCircle, MoreHorizontal } from "lucide-react";
import ClientDate from "@/components/common/ClientDate";
import { useRouter } from "next/navigation";

interface CaseDetailHeaderProps {
  caseDetail: CaseDetail;
}

export default function CaseDetailHeader({ caseDetail }: CaseDetailHeaderProps) {
  const router = useRouter();
  const handleAssignToMe = async () => {
    try {
      const { updateCaseStatus } = await import("@/services/cases");
      await updateCaseStatus(caseDetail.id, caseDetail.status, "System Administrator");
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to assign case");
    }
  };

  const handleResolve = async () => {
    try {
      const { updateCaseStatus } = await import("@/services/cases");
      await updateCaseStatus(caseDetail.id, "Resolved", caseDetail.assignee || undefined);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to resolve case");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const { generateReport, getTemplates } = await import("@/services/reports");
      const templates = await getTemplates().catch(() => []);
      
      const payload: any = {
        name: `Report for Case ${caseDetail.id}`,
        source_type: "Case",
        source_id: caseDetail.id.toString(),
      };
      if (templates && templates.length > 0) {
        payload.template_id = templates[0].id;
      }
      
      const report = await generateReport(payload);
      alert(`Report generated: ${report.name}`);
      router.push("/reports");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to generate report");
    }
  };

  const handleEscalate = async () => {
    try {
      const { escalateCase } = await import("@/services/cases");
      await escalateCase(caseDetail.id);
      router.refresh();
    } catch (e) {
      console.error(e);
      alert("Failed to escalate case");
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 border-b-4 border-b-soc-accent mb-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-soc-bg border border-soc-border rounded-full text-xs font-mono text-soc-text-secondary">
              CASE-{caseDetail.id}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
              caseDetail.status === 'Resolved' || caseDetail.status === 'Closed' ? 'bg-soc-success/20 text-soc-success border-soc-success' : 
              caseDetail.status === 'New' ? 'bg-soc-danger/20 text-soc-danger border-soc-danger' : 'bg-soc-warning/20 text-soc-warning border-soc-warning'
            }`}>
              {caseDetail.status}
            </span>
            {caseDetail.priority === 'High' && (
              <span className="px-3 py-1 bg-soc-danger/20 border border-soc-danger text-soc-danger rounded-full text-xs font-bold flex items-center">
                <ShieldAlert className="w-3 h-3 mr-1" /> High Priority
              </span>
            )}
            <span className="px-3 py-1 bg-soc-bg border border-soc-border rounded-full text-xs font-mono text-soc-text-secondary">
              Risk Score: {caseDetail.risk_score}
            </span>
            <span className="px-3 py-1 bg-soc-bg border border-soc-border rounded-full text-xs font-mono text-soc-text-secondary">
              Impact: {caseDetail.business_impact}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-soc-text-primary mb-2">{caseDetail.title}</h1>
          <p className="text-soc-text-secondary text-sm max-w-3xl mb-4">{caseDetail.description}</p>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-soc-text-muted font-mono">
            <div><span className="uppercase text-soc-text-muted mr-1">Created:</span> <ClientDate date={caseDetail.created_at} format="full" /></div>
            <div><span className="uppercase text-soc-text-muted mr-1">Updated:</span> <ClientDate date={caseDetail.updated_at} format="full" /></div>
            <div><span className="uppercase text-soc-text-muted mr-1">Analyst:</span> {caseDetail.assignee || 'Unassigned'}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-[250px]">
          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-soc-text-muted uppercase tracking-wider font-semibold">SLA Status</span>
              {caseDetail.sla_status === "On Track" ? (
                <CheckCircle className="w-4 h-4 text-soc-success" />
              ) : (
                <Clock className="w-4 h-4 text-soc-danger animate-pulse" />
              )}
            </div>
            <div className="text-lg font-bold text-soc-text-primary mb-1">{caseDetail.sla_status}</div>
            <div className="w-full bg-soc-card rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${caseDetail.sla_status === 'On Track' ? 'bg-soc-success w-1/3' : 'bg-soc-danger w-full glow-danger'}`}></div>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleAssignToMe}
              className="flex-1 bg-soc-accent hover:bg-soc-accent/80 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Assign to Me
            </button>
            {caseDetail.status.toLowerCase() !== 'closed' && caseDetail.status.toLowerCase() !== 'resolved' && (
              <button 
                onClick={handleResolve}
                className="flex-1 bg-soc-success hover:bg-soc-success/80 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Resolve
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleEscalate}
              className="flex-1 bg-soc-bg hover:bg-soc-danger/20 border border-soc-border hover:border-soc-danger hover:text-soc-danger py-2 rounded-lg text-xs font-medium text-soc-text-secondary transition-colors"
            >
              Escalate
            </button>
            <button 
              onClick={handleGenerateReport}
              className="flex-1 bg-soc-bg hover:bg-soc-accent/20 border border-soc-border hover:border-soc-accent hover:text-soc-accent py-2 rounded-lg text-xs font-medium text-soc-text-secondary transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
