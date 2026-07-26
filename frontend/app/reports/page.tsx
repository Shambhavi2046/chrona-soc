"use client";

import { useEffect, useState } from "react";
import ModuleHeader from "@/components/common/ModuleHeader";
import MockModeBanner from "@/components/common/MockModeBanner";
import { FileText, RefreshCw, Download, Plus, FilePlus2, Loader2, AlertCircle } from "lucide-react";
import SummaryCards from "@/components/reports/SummaryCards";
import TemplateGallery from "@/components/reports/TemplateGallery";
import GeneratedReportsTable from "@/components/reports/GeneratedReportsTable";
import ComplianceDashboard from "@/components/reports/ComplianceDashboard";
import FrameworkCards from "@/components/reports/FrameworkCards";
import ExecutiveDashboard from "@/components/reports/ExecutiveDashboard";
import ReportGenerator from "@/components/reports/ReportGenerator";
import ReportPreview from "@/components/reports/ReportPreview";
import AIReportAssistant from "@/components/reports/AIReportAssistant";

import { mockFrameworks } from "@/lib/mocks/reports";
import { GeneratedReport, ReportTemplate } from "@/types/reports";
import { getReports, getTemplates } from "@/services/reports";

export default function ReportsWorkspace() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, t] = await Promise.all([getReports(), getTemplates()]);
      setReports(r);
      setTemplates(t);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch reports data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      <ModuleHeader
        title="Reports & Compliance"
        subtitle="Generate professional security reports, compliance assessments, and executive summaries."
        icon={FileText}
        actions={[
          { label: "Refresh", icon: RefreshCw, onClick: fetchData },
          { label: "Export All", icon: Download },
          { label: "New Template", icon: Plus, variant: "outline" },
          { label: "Generate Report", icon: FilePlus2, variant: "primary" }
        ]}
      />



      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-soc-accent mb-4" />
          <p>Loading reports workspace...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          {error}
        </div>
      ) : (
        <>
          <SummaryCards />
          <ExecutiveDashboard />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 flex flex-col gap-6">
              <ReportGenerator templates={templates} onGenerateSuccess={fetchData} />
              <AIReportAssistant />
            </div>
            <div className="xl:col-span-2">
              <ReportPreview report={selectedReport || reports[0]} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <ComplianceDashboard />
            </div>
            <div className="lg:col-span-2">
              <FrameworkCards frameworks={mockFrameworks} />
            </div>
          </div>

          <TemplateGallery templates={templates} />
          <GeneratedReportsTable reports={reports} onRefresh={fetchData} />
        </>
      )}
    </div>
  );
}
