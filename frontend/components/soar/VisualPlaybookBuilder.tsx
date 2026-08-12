import { GitMerge, Zap, Shield, HelpCircle, Mail, Database, X, AlertTriangle, Play, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { Playbook } from "@/types";
import { PlaybookNode } from "@/types/soar";
import NodeConfigModal from "./NodeConfigModal";

interface VisualPlaybookBuilderProps {
  playbook?: Playbook | null;
  onSave?: (workflow_definition: any) => void;
}

const defaultNodes: PlaybookNode[] = [
  { id: 1, category: "Trigger", type: "log", config: { message: "Trigger: Email Alert Received" }, title: "Email Alert Received" },
  { id: 2, category: "Action", type: "set_variable", config: { name: "investigation_started", value: true }, title: "Start Investigation" },
  { id: 3, category: "Integration", type: "integration", config: { integration: "threatfox", credential_id: "", ioc: "{{alert.ioc}}" }, title: "Extract IOCs (ThreatFox)" },
  { id: 4, category: "Decision", type: "condition", config: { variable: "investigation_started", operator: "equals", value: true }, title: "Proceed?" },
  { id: 5, category: "Action", type: "log", config: { message: "Quarantine User Action Executed" }, title: "Quarantine User" },
];

const getNodeVisuals = (category: string) => {
  switch (category) {
    case "Trigger": return { icon: Mail, color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/10" };
    case "Action": return { icon: Shield, color: "text-purple-400", border: "border-purple-500/50", bg: "bg-purple-500/10" };
    case "Integration": return { icon: Database, color: "text-emerald-400", border: "border-emerald-500/50", bg: "bg-emerald-500/10" };
    case "Decision": return { icon: GitMerge, color: "text-orange-400", border: "border-orange-500/50", bg: "bg-orange-500/10" };
    default: return { icon: HelpCircle, color: "text-gray-400", border: "border-gray-500/50", bg: "bg-gray-500/10" };
  }
};

export default function VisualPlaybookBuilder({ playbook, onSave }: VisualPlaybookBuilderProps) {
  const [nodes, setNodes] = useState<PlaybookNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<PlaybookNode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const definition = playbook?.definition || playbook?.workflow_definition;
    if (definition?.nodes) {
      setNodes(JSON.parse(JSON.stringify(definition.nodes)));
    } else {
      setNodes(JSON.parse(JSON.stringify(defaultNodes)));
    }
  }, [playbook]);

  const handleAddNode = () => {
    const newNode: PlaybookNode = {
      id: Date.now(),
      category: "Action",
      type: "log",
      config: { message: "New Action" },
      title: "New Action",
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    if (onSave && playbook) {
      onSave({ nodes: newNodes });
    }
  };

  const handleDeleteNode = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newNodes = nodes.filter(n => n.id !== id);
    setNodes(newNodes);
    if (onSave && playbook) {
      onSave({ nodes: newNodes });
    }
  };

  const handleNodeClick = (node: PlaybookNode) => {
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const handleSaveNode = (updatedNode: PlaybookNode) => {
    const newNodes = nodes.map(n => n.id === updatedNode.id ? updatedNode : n);
    setNodes(newNodes);
    if (onSave && playbook) {
      onSave({ nodes: newNodes });
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-soc-border">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Zap className="w-5 h-5 text-soc-accent" />
          Playbook Builder: <span className="text-soc-text-secondary font-normal">{playbook ? playbook.name : 'Select a Playbook'}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const definition = playbook?.definition || playbook?.workflow_definition;
              if (definition?.nodes) {
                setNodes(JSON.parse(JSON.stringify(definition.nodes)));
              } else {
                setNodes(JSON.parse(JSON.stringify(defaultNodes)));
              }
            }}
            className="px-3 py-1.5 bg-soc-bg border border-soc-border hover:border-gray-500 rounded text-xs font-medium text-soc-text-secondary transition-colors"
          >
            Discard
          </button>
          <button
            onClick={() => onSave && playbook && onSave({ nodes })}
            disabled={!playbook}
            className="px-3 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors shadow-lg disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 overflow-y-auto bg-soc-bg/30 rounded-lg border border-soc-border/50 relative p-8 flex flex-col items-center">

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-md">
          {nodes.map((node: PlaybookNode, idx: number) => {
            const visual = getNodeVisuals(node.category);
            const Icon = visual.icon;
            const isLast = idx === nodes.length - 1;

            return (
              <div key={node.id} className="flex flex-col items-center w-full group relative">

                {/* Node Box */}
                <div
                  onClick={() => handleNodeClick(node)}
                  className={`w-full max-w-[280px] bg-soc-card border ${visual.border} rounded-lg p-3 shadow-lg flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-pointer hover:border-soc-accent`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${visual.bg}`}>
                      <Icon className={`w-4 h-4 ${visual.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-soc-text-muted uppercase tracking-wider">{node.category || node.type}</p>
                      <h4 className="text-sm font-medium text-soc-text-primary">{node.title}</h4>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNode(node.id, e)}
                    className="p-1 text-soc-text-muted hover:text-red-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div className="w-0.5 h-10 bg-soc-border relative flex justify-center">
                    {/* Arrow head */}
                    <div className="absolute bottom-0 w-2 h-2 border-r-2 border-b-2 border-soc-border transform rotate-45 mb-1" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Add Node Button */}
          <div className="w-0.5 h-8 bg-soc-border border-dashed relative flex justify-center mt-2"></div>
          <button
            onClick={handleAddNode}
            className="mt-2 w-full max-w-[280px] border-2 border-dashed border-soc-border hover:border-soc-accent rounded-lg p-3 flex items-center justify-center gap-2 text-sm text-soc-text-secondary hover:text-soc-text-primary transition-colors bg-soc-bg hover:bg-soc-card-hover"
          >
            <Plus className="w-4 h-4" /> Add Next Step
          </button>
        </div>

      </div>

      <NodeConfigModal
        isOpen={isModalOpen}
        node={selectedNode}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
      />
    </div>
  );
}
