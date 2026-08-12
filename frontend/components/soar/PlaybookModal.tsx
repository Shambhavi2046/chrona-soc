import { useState, useEffect } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { Playbook } from "@/types";

interface PlaybookModalProps {
  playbook?: Playbook | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Playbook>) => Promise<void>;
}

export default function PlaybookModal({ playbook, isOpen, onClose, onSave }: PlaybookModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [triggerType, setTriggerType] = useState("Manual");
  const [status, setStatus] = useState("Draft");
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (playbook) {
        setName(playbook.name);
        setDescription(playbook.description || "");
        setCategory(playbook.category || "General");
        setTriggerType(playbook.trigger_type || "Manual");
        setStatus(playbook.status || "Draft");
      } else {
        setName("");
        setDescription("");
        setCategory("General");
        setTriggerType("Manual");
        setStatus("Draft");
      }
      setError(null);
    }
  }, [isOpen, playbook]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Playbook name is required.");
      return;
    }
    try {
      setIsSaving(true);
      setError(null);
      await onSave({
        name,
        description,
        category,
        trigger_type: triggerType,
        status
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the playbook.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-soc-bg border border-soc-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-soc-border bg-soc-card flex items-center justify-between">
          <h2 className="text-lg font-bold text-soc-text-primary">
            {playbook ? "Edit Playbook" : "New Playbook"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary hover:bg-soc-bg rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-soc-text-secondary mb-1">Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
              placeholder="e.g. Phishing Response"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-soc-text-secondary mb-1">Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent min-h-[80px]"
              placeholder="Describe the playbook's purpose..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
              >
                <option value="General">General</option>
                <option value="Incident Response">Incident Response</option>
                <option value="Enrichment">Enrichment</option>
                <option value="Containment">Containment</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Trigger Type</label>
              <select 
                value={triggerType}
                onChange={e => setTriggerType(e.target.value)}
                className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
              >
                <option value="Manual">Manual</option>
                <option value="Email Alert">Email Alert</option>
                <option value="EDR Alert">EDR Alert</option>
                <option value="SIEM Rule">SIEM Rule</option>
                <option value="API Hook">API Hook</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-soc-text-secondary mb-1">Status</label>
            <select 
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
            >
              <option value="Draft">Draft</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>
          
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-soc-border bg-soc-card flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm font-medium text-soc-text-secondary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-soc-accent hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
        
      </div>
    </>
  );
}
