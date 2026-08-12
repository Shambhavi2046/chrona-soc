"use client";

import { useEffect, useState } from "react";
import ModuleHeader from "@/components/common/ModuleHeader";
import MockModeBanner from "@/components/common/MockModeBanner";
import { FileText, RefreshCw, Download, Plus, FilePlus2, Loader2, AlertCircle } from "lucide-react";
import SummaryCards from "@/components/reports/SummaryCards";
import TemplateGallery from "@/components/reports/TemplateGallery";
import GeneratedReportsTable from "@/components/reports/GeneratedReportsTable";
import ExecutiveDashboard from "@/components/reports/ExecutiveDashboard";
import ReportGenerator from "@/components/reports/ReportGenerator";
import ReportPreview from "@/components/reports/ReportPreview";

import { GeneratedReport, ReportTemplate } from "@/types/reports";
import { getReports, getTemplates, exportAllReportsZip } from "@/services/reports";
import { getAnalytics } from "@/services/analytics";
import NewTemplateModal from "@/components/reports/NewTemplateModal";

export default function ReportsWorkspace() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, t, a] = await Promise.all([getReports(), getTemplates(), getAnalytics()]);
      setReports(r);
      setTemplates(t);
      setAnalytics(a);
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
          { label: "Export All", icon: Download, onClick: async () => {
            try { await exportAllReportsZip(); } 
            catch (e: any) { alert(e.message || "Failed to export reports"); }
          }},
          { label: "New Template", icon: Plus, variant: "outline", onClick: () => setIsTemplateModalOpen(true) },
          { label: "Generate Report", icon: FilePlus2, variant: "primary", onClick: () => document.getElementById('report-generator')?.scrollIntoView({ behavior: 'smooth' }) }
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-soc-text-secondary">
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
          <NewTemplateModal 
            isOpen={isTemplateModalOpen} 
            onClose={() => setIsTemplateModalOpen(false)} 
            onSuccess={fetchData} 
          />
          <SummaryCards reportCount={reports.length} analytics={analytics} />
          <ExecutiveDashboard analytics={analytics} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div id="report-generator" className="xl:col-span-1 flex flex-col gap-6">
              <ReportGenerator 
                templates={templates} 
                preselectedTemplateId={selectedTemplateForGen}
                onGenerateSuccess={fetchData} 
              />
            </div>
            <div className="xl:col-span-2">
              <ReportPreview report={selectedReport || reports[0]} />
            </div>
          </div>

          <TemplateGallery 
            templates={templates} 
            onUseTemplate={(id) => {
              setSelectedTemplateForGen(id);
              document.getElementById('report-generator')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <GeneratedReportsTable reports={reports} onRefresh={fetchData} />
        </>
      )}
    </div>
  );
}
