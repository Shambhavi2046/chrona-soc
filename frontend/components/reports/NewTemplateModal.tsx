import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createTemplate } from "@/services/reports";

interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewTemplateModal({ isOpen, onClose, onSuccess }: NewTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createTemplate({ name, description, category, estimated_pages: 1 });
      onSuccess();
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setCategory("Standard");
    } catch (err: any) {
      setError(err.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-soc-bg border border-soc-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-soc-border">
          <h3 className="text-lg font-semibold text-white">New Report Template</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-soc-accent transition-colors"
              placeholder="e.g., Executive Summary"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-soc-accent transition-colors h-24 resize-none"
              placeholder="Optional description..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Category Layout</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-soc-accent transition-colors"
            >
              <option value="Standard">Standard Incident Report</option>
              <option value="Executive">Executive Summary</option>
              <option value="Compliance">Compliance Audit</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-soc-accent hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
