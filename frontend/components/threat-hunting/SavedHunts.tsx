import { Database, Play, Edit3, Trash2, Clock, Check, X } from "lucide-react";
import { useState } from "react";
import { SavedHunt } from "@/types";

interface SavedHuntsProps {
  hunts: SavedHunt[];
  error?: string | null;
  onRun?: (hunt: SavedHunt) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

export default function SavedHunts({ hunts, error, onRun, onDelete, onRename }: SavedHuntsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleStartEdit = (hunt: SavedHunt) => {
    setEditingId(hunt.id);
    setEditName(hunt.name);
  };

  const handleSaveEdit = () => {
    if (editingId && onRename) {
      onRename(editingId, editName);
    }
    setEditingId(null);
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Database className="w-5 h-5 text-soc-accent" />
          Saved Hunts
        </div>
      </div>
      
      {error ? (
        <div className="text-center p-8 text-red-400 bg-soc-card border border-red-900 rounded">{error}</div>
      ) : hunts.length === 0 ? (
        <div className="text-center p-8 text-gray-400">No saved hunts yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hunts.map((hunt) => (
            <div key={hunt.id} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                {editingId === hunt.id ? (
                  <div className="flex items-center gap-2 w-full pr-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-soc-card border border-soc-accent rounded px-2 py-1 text-sm text-white w-full"
                    />
                    <button onClick={handleSaveEdit} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-white truncate pr-4">{hunt.name}</h4>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-soc-bg pl-2">
                      <button onClick={() => handleStartEdit(hunt)} className="p-1.5 text-gray-400 hover:text-white hover:bg-soc-card rounded transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => onDelete && onDelete(hunt.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-soc-card rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-soc-card border border-soc-border rounded text-[10px] font-mono text-gray-300">
                  {hunt.mitre_mapping || "No Mapping"}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {hunt.last_run ? new Date(hunt.last_run).toLocaleString() : "Never"}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-soc-border/50">
                <span className="text-xs text-gray-500">By {hunt.author}</span>
                <button onClick={() => onRun && onRun(hunt)} className="flex items-center gap-1.5 px-3 py-1.5 bg-soc-card hover:bg-soc-accent hover:text-white border border-soc-border rounded-md text-xs font-medium text-soc-accent transition-colors">
                  <Play className="w-3 h-3" /> Run
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
