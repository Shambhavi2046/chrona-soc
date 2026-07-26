import { BookTemplate, Play, Edit3, Settings } from "lucide-react";
import { Playbook } from "@/types";

interface PlaybookLibraryProps {
  playbooks: Playbook[];
}

export default function PlaybookLibrary({ playbooks }: PlaybookLibraryProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <BookTemplate className="w-5 h-5 text-soc-accent" />
          Playbook Library
        </div>
        <button className="text-xs text-soc-accent hover:text-white transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 max-h-[400px]">
        {playbooks.map((playbook) => (
          <div key={playbook.id} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group relative">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-bold text-white group-hover:text-soc-accent transition-colors truncate pr-2">{playbook.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                playbook.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                playbook.status === 'Inactive' ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20' :
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {playbook.status}
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mt-1 line-clamp-2 h-8">
              {playbook.description}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center"><Settings className="w-3 h-3 mr-1" /> {playbook.trigger}</span>
              <span>Ran {playbook.lastRun}</span>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-soc-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-soc-card hover:bg-soc-bg border border-soc-border hover:border-gray-500 rounded text-xs font-medium text-gray-300 transition-colors">
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors">
                <Play className="w-3.5 h-3.5" /> Run
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
