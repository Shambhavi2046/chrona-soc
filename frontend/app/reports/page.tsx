"use client";

import ModuleHeader from "@/components/common/ModuleHeader";
import MockModeBanner from "@/components/common/MockModeBanner";
import { FileText, RefreshCw, Download, Plus, FilePlus2 } from "lucide-react";
import SummaryCards from "@/components/reports/SummaryCards";
import TemplateGallery from "@/components/reports/TemplateGallery";
import GeneratedReportsTable from "@/components/reports/GeneratedReportsTable";
import ComplianceDashboard from "@/components/reports/ComplianceDashboard";
import FrameworkCards from "@/components/reports/FrameworkCards";
import ExecutiveDashboard from "@/components/reports/ExecutiveDashboard";
import ReportGenerator from "@/components/reports/ReportGenerator";
import ReportPreview from "@/components/reports/ReportPreview";
import AIReportAssistant from "@/components/reports/AIReportAssistant";

import { mockTemplates, mockReports, mockFrameworks } from "@/lib/mocks/reports";

export default function ReportsWorkspace() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Reports & Compliance"
        subtitle="Generate professional security reports, compliance assessments, and executive summaries."
        icon={FileText}
        actions={[
          { label: "Refresh", icon: RefreshCw },
          { label: "Export All", icon: Download },
          { label: "New Template", icon: Plus, variant: "outline" },
          { label: "Generate Report", icon: FilePlus2, variant: "primary" }
        ]}
      />

      <MockModeBanner moduleName="Reports & Compliance" />

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Executive Security Posture */}
      <ExecutiveDashboard />

      {/* Report Generation Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 flex flex-col gap-6">
          <ReportGenerator />
          <AIReportAssistant />
        </div>
        <div className="xl:col-span-2">
          <ReportPreview />
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ComplianceDashboard />
        </div>
        <div className="lg:col-span-2">
          <FrameworkCards frameworks={mockFrameworks} />
        </div>
      </div>

      {/* Templates & Generated Reports */}
      <TemplateGallery templates={mockTemplates} />
      <GeneratedReportsTable reports={mockReports} />

    </div>
  );
}
