"use client";

import { useState, useEffect } from "react";

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

import PlaybookModal from "@/components/soar/PlaybookModal";
import * as soarApi from "@/services/soar";

import { ExecutionLog, Playbook } from "@/types";
import { mockIntegrations } from "@/lib/mocks/soar";

export default function SoarWorkspace() {
  const [selectedExec, setSelectedExec] = useState<ExecutionLog | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaybook, setEditingPlaybook] = useState<Playbook | null>(null);

  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);

  const fetchPlaybooks = async () => {
    try {
      const data = await soarApi.getPlaybooks();
      setPlaybooks(data);
      if (data.length > 0 && !selectedPlaybook) {
        setSelectedPlaybook(data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch playbooks:", err);
    }
  };

  const fetchExecutions = async () => {
    try {
      const data = await soarApi.getExecutions();
      setExecutions(data);
    } catch (err) {
      console.error("Failed to fetch executions:", err);
    }
  };

  useEffect(() => {
    fetchPlaybooks();
    fetchExecutions();
  }, []);

  const handleSavePlaybook = async (data: Partial<Playbook>) => {
    if (editingPlaybook) {
      await soarApi.updatePlaybook(editingPlaybook.id, data);
    } else {
      await soarApi.createPlaybook(data);
    }
    fetchPlaybooks();
  };

  const handleDuplicate = async (playbook: Playbook) => {
    const { id, created_at, updated_at, created_by, ...rest } = playbook;
    await soarApi.createPlaybook({ ...rest, name: `${rest.name} (Copy)` });
    fetchPlaybooks();
  };

  const handleRunPlaybook = async (id: string) => {
    try {
      await soarApi.executePlaybook(id);
      fetchExecutions();
    } catch (err) {
      console.error("Failed to execute playbook:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="SOAR Automation"
        subtitle="Security Orchestration, Automation and Response. Streamline SOC workflows with playbooks."
        icon={Workflow}
        actions={[
          { label: "Refresh", icon: RefreshCw, onClick: fetchPlaybooks },
          { label: "Import", icon: Upload },
          { label: "Export", icon: Download },
          { label: "New Playbook", icon: Plus, variant: "primary", onClick: () => { setEditingPlaybook(null); setIsModalOpen(true); } }
        ]}
      />

      {/* Summary KPI Cards */}
      <SummaryCards playbooks={playbooks} executions={executions} />

      {/* Playbook Builder & Library */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <VisualPlaybookBuilder 
            playbook={selectedPlaybook} 
            onSave={async (definition) => {
              if (selectedPlaybook) {
                const updated = await soarApi.updatePlaybook(selectedPlaybook.id, { workflow_definition: definition });
                setSelectedPlaybook(updated);
                fetchPlaybooks();
              }
            }} 
          />
        </div>
        <div className="xl:col-span-1">
          <PlaybookLibrary 
            playbooks={playbooks} 
            onSelect={(pb) => setSelectedPlaybook(pb)}
            onEdit={(pb) => { setSelectedPlaybook(pb); setEditingPlaybook(pb); setIsModalOpen(true); }}
            onDelete={async (id) => { await soarApi.deletePlaybook(id); fetchPlaybooks(); }}
            onActivate={async (id) => { await soarApi.activatePlaybook(id); fetchPlaybooks(); }}
            onDeactivate={async (id) => { await soarApi.deactivatePlaybook(id); fetchPlaybooks(); }}
            onDuplicate={handleDuplicate}
            onRun={handleRunPlaybook}
          />
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
          executions={executions} 
          onRowClick={(exec) => setSelectedExec(exec)} 
        />
      </div>

      {/* Execution Details Drawer Overlay */}
      <ExecutionDrawer 
        execution={selectedExec} 
        onClose={() => setSelectedExec(null)} 
      />

      {/* Playbook Modal */}
      <PlaybookModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPlaybook(null); }}
        playbook={editingPlaybook}
        onSave={handleSavePlaybook}
      />
    </div>
  );
}
