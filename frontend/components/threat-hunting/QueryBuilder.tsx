import { Code2, Plus, Trash2 } from "lucide-react";

export default function QueryBuilder() {
  const rules = [
    { field: "Source", operator: "=", value: "Windows Security Logs" },
    { field: "EventID", operator: "=", value: "4625" },
    { field: "Username", operator: "contains", value: "Administrator" }
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Code2 className="w-5 h-5 text-soc-accent" />
          Visual Query Builder
        </div>
        <button className="text-xs text-soc-accent hover:text-white transition-colors flex items-center">
          Switch to Raw KQL
        </button>
      </div>

      <div className="space-y-3 bg-soc-bg/50 p-4 rounded-lg border border-soc-border/50">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-soc-accent w-12 uppercase">Where</span>
          <select className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-soc-accent min-w-[150px]">
            <option>Time</option>
            <option>Source</option>
          </select>
          <select className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-soc-warning focus:outline-none focus:border-soc-accent">
            <option>&gt;</option>
          </select>
          <input type="text" value="Last 24 Hours" className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-soc-accent flex-1" readOnly />
        </div>

        {rules.map((rule, idx) => (
          <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
            <span className="text-xs font-mono font-bold text-soc-accent w-12 text-right uppercase">And</span>
            <select className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-soc-accent min-w-[150px]">
              <option>{rule.field}</option>
            </select>
            <select className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-soc-warning focus:outline-none focus:border-soc-accent min-w-[100px]">
              <option>{rule.operator}</option>
            </select>
            <input type="text" defaultValue={rule.value} className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-green-400 focus:outline-none focus:border-soc-accent font-mono flex-1" />
            <button className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-soc-card rounded transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2 mt-2 border-t border-soc-border/50">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-soc-card hover:bg-soc-accent/10 border border-soc-border hover:border-soc-accent rounded text-sm text-gray-400 hover:text-soc-accent transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-soc-card hover:bg-soc-accent/10 border border-soc-border hover:border-soc-accent rounded text-sm text-gray-400 hover:text-soc-accent transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Group
          </button>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="px-6 py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors">
          Run Query
        </button>
      </div>
    </div>
  );
}
