import { Code2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { HuntQueryRequest } from "@/types";

interface Props {
  query: HuntQueryRequest;
  onUpdate: (q: Partial<HuntQueryRequest>) => void;
  onRun: (q?: Partial<HuntQueryRequest>) => void;
}

export default function QueryBuilder({ query, onUpdate, onRun }: Props) {
  const [isRaw, setIsRaw] = useState(false);
  const [rawText, setRawText] = useState(query.query || "");
  const [rules, setRules] = useState([
    { field: "Username", operator: "=", value: "" }
  ]);

  const handleRun = () => {
    let updates: Partial<HuntQueryRequest> = {};
    if (isRaw) {
      updates = { query: rawText };
    } else {
      // Compile visual rules into HuntQueryRequest fields
      rules.forEach(r => {
        if (!r.value) return;
        if (r.field === "Username") updates.username = r.value;
        if (r.field === "Hostname") updates.hostname = r.value;
        if (r.field === "Severity") updates.severity = r.value;
        if (r.field === "IOC") updates.ioc = r.value;
        if (r.field === "Raw Query") updates.query = r.value;
      });
    }
    onUpdate(updates);
    onRun(updates);
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Code2 className="w-5 h-5 text-soc-accent" />
          {isRaw ? "Raw KQL Editor" : "Visual Query Builder"}
        </div>
        <button 
          onClick={() => setIsRaw(!isRaw)}
          className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors flex items-center"
        >
          {isRaw ? "Switch to Visual Builder" : "Switch to Raw KQL"}
        </button>
      </div>

      <div className="space-y-3 bg-soc-bg/50 p-4 rounded-lg border border-soc-border/50">
        {isRaw ? (
          <textarea 
            className="w-full bg-soc-card border border-soc-border rounded p-3 text-sm text-soc-text-primary font-mono h-32 focus:outline-none focus:border-soc-accent"
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            placeholder="Enter search query..."
          />
        ) : (
          <>
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-3 animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 100}ms` }}>
                <span className="text-xs font-mono font-bold text-soc-accent w-12 text-right uppercase">
                  {idx === 0 ? "Where" : "And"}
                </span>
                <select 
                  className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent min-w-[150px]"
                  value={rule.field}
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[idx].field = e.target.value;
                    setRules(newRules);
                  }}
                >
                  <option>Username</option>
                  <option>Hostname</option>
                  <option>Severity</option>
                  <option>IOC</option>
                  <option>Raw Query</option>
                </select>
                <select className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-soc-warning focus:outline-none focus:border-soc-accent min-w-[100px]">
                  <option>=</option>
                  <option>contains</option>
                </select>
                <input 
                  type="text" 
                  value={rule.value} 
                  onChange={(e) => {
                    const newRules = [...rules];
                    newRules[idx].value = e.target.value;
                    setRules(newRules);
                  }}
                  className="bg-soc-card border border-soc-border rounded px-3 py-1.5 text-sm text-green-400 focus:outline-none focus:border-soc-accent font-mono flex-1" 
                />
                <button 
                  onClick={() => {
                    if (rules.length > 1) {
                      setRules(rules.filter((_, i) => i !== idx));
                    }
                  }}
                  className="p-1.5 text-soc-text-muted hover:text-red-400 hover:bg-soc-card rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-3 pt-2 mt-2 border-t border-soc-border/50">
              <button 
                onClick={() => setRules([...rules, { field: "Username", operator: "=", value: "" }])}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-soc-card hover:bg-soc-accent/10 border border-soc-border hover:border-soc-accent rounded text-sm text-soc-text-secondary hover:text-soc-accent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rule
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={handleRun}
          className="px-6 py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
        >
          Run Query
        </button>
      </div>
    </div>
  );
}
