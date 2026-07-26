import { useState } from "react";
import { Settings2, FileText, Loader2 } from "lucide-react";
import { ReportTemplate } from "@/types/reports";
import { generateReport } from "@/services/reports";

interface ReportGeneratorProps {
  templates?: ReportTemplate[];
  onGenerateSuccess?: () => void;
}

export default function ReportGenerator({ templates = [], onGenerateSuccess }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [sourceType, setSourceType] = useState("Alert");
  const [sourceId, setSourceId] = useState("");
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState("");

  const mapToUuid = (id: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex}-aaaa-4000-8000-a00000000000`;
  };

  const handleGenerate = async () => {
    if (!name || !sourceId || (!templateId && templates.length > 0)) {
      alert("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);
    try {
      const selectedTemplateId = templateId || templates[0]?.id;
      const validSourceId = mapToUuid(sourceId);
      
      await generateReport({
        name,
        source_type: sourceType,
        source_id: validSourceId,
        template_id: selectedTemplateId
      });
      if (onGenerateSuccess) onGenerateSuccess();
      setName("");
      setSourceId("");
    } catch (e) {
      console.error(e);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-6 text-white font-medium">
        <Settings2 className="w-5 h-5 text-soc-accent" />
        Report Configuration
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Report Name</label>
          <input 
            type="text" 
            placeholder="e.g. Q3 Executive Summary"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-soc-accent" 
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Source Type</label>
          <select 
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-soc-accent"
          >
            <option value="Alert">Alert</option>
            <option value="Investigation">Investigation</option>
            <option value="Threat Hunt">Threat Hunt</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Source ID (UUID)</label>
          <input 
            type="text" 
            placeholder="00000000-0000-0000-0000-000000000000"
            value={sourceId}
            onChange={(e) => setSourceId(e.target.value)}
            className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-soc-accent font-mono" 
          />
        </div>

        {templates.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Template</label>
            <select 
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-soc-accent"
            >
              <option value="" disabled>Select a template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-4 border-t border-soc-border/50">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 bg-soc-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} 
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
