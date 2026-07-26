import { Filter, ChevronDown } from "lucide-react";

export default function FilterPanel() {
  const filters = [
    { name: "Time Range", default: "Last 24 Hours" },
    { name: "Data Source", default: "All Sources" },
    { name: "Host", default: "Any Host" },
    { name: "Severity", default: "All Severities" },
    { name: "MITRE Tactic", default: "Any Tactic" },
    { name: "Event ID", default: "Any ID" }
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4 text-white font-medium">
        <Filter className="w-4 h-4 text-soc-accent" />
        Filters
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {filters.map((filter, idx) => (
          <div key={idx} className="relative">
            <label className="block text-xs text-gray-500 mb-1">{filter.name}</label>
            <button className="w-full flex items-center justify-between px-3 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm text-gray-300 transition-colors text-left">
              <span className="truncate">{filter.default}</span>
              <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
