"use client";

import { useState } from "react";
import MockModeBanner from "@/components/common/MockModeBanner";
import ModuleHeader from "@/components/common/ModuleHeader";
import { Workflow, RefreshCw, Upload, Download, Plus } from "lucide-react";
import SummaryCards from "@/components/soar/SummaryCards";
import PlaybookLibrary from "@/components/soar/PlaybookLibrary";
import VisualPlaybookBuilder from "@/components/soar/VisualPlaybookBuilder";
import ExecutionHistory from "@/components/soar/ExecutionHistory";
import ExecutionDrawer from "@/components/soar/ExecutionDrawer";
import IntegrationsPanel from "@/components/soar/IntegrationsPanel";
import AIPlaybookAssistant from "@/components/soar/AIPlaybookAssistant";
import Analytics from "@/components/soar/Analytics";

import { ExecutionLog } from "@/types";
import { mockPlaybooks, mockExecutions, mockIntegrations } from "@/lib/mocks/soar";

export default function SoarWorkspace() {
  const [selectedExec, setSelectedExec] = useState<ExecutionLog | null>(null);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="SOAR Automation"
        subtitle="Security Orchestration, Automation and Response. Streamline SOC workflows with playbooks."
        icon={Workflow}
        actions={[
          { label: "Refresh", icon: RefreshCw },
          { label: "Import", icon: Upload },
          { label: "Export", icon: Download },
          { label: "New Playbook", icon: Plus, variant: "primary" }
        ]}
      />

      <MockModeBanner moduleName="SOAR Automation" />

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Playbook Builder & Library */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <VisualPlaybookBuilder />
        </div>
        <div className="xl:col-span-1">
          <PlaybookLibrary playbooks={mockPlaybooks} />
        </div>
      </div>

      {/* Integrations & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IntegrationsPanel integrations={mockIntegrations} />
        </div>
        <div className="lg:col-span-1">
          <Analytics />
        </div>
        <div className="lg:col-span-1">
          <AIPlaybookAssistant />
        </div>
      </div>

      {/* Execution History */}
      <div className="h-[400px]">
        <ExecutionHistory 
          executions={mockExecutions} 
          onRowClick={(exec) => setSelectedExec(exec)} 
        />
      </div>

      {/* Execution Details Drawer Overlay */}
      <ExecutionDrawer 
        execution={selectedExec} 
        onClose={() => setSelectedExec(null)} 
      />
    </div>
  );
}
