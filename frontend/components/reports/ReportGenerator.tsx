import { Settings2, Calendar, FileText, Bot } from "lucide-react";

export default function ReportGenerator() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-6 text-white font-medium">
        <Settings2 className="w-5 h-5 text-soc-accent" />
        Report Configuration
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Report Type</label>
          <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-soc-accent">
            <option>Executive Summary</option>
            <option>Incident Report</option>
            <option>Threat Hunting Summary</option>
            <option>Compliance Audit</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Date Range</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-2 w-4 h-4 text-gray-500" />
              <input type="text" value="Oct 1, 2023" readOnly className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none" />
            </div>
            <span className="text-gray-500 self-center">to</span>
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-2 w-4 h-4 text-gray-500" />
              <input type="text" value="Oct 31, 2023" readOnly className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 focus:outline-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Include Sections</label>
          <div className="grid grid-cols-2 gap-3">
            {["AI Summary", "Timeline", "Charts", "IOC List", "Recommendations", "Raw Logs"].map(sec => (
              <label key={sec} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" defaultChecked={sec !== "Raw Logs"} className="w-4 h-4 rounded border-gray-500 bg-soc-bg text-soc-accent focus:ring-soc-accent/50 focus:ring-1" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{sec}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-soc-border/50">
          <button className="w-full py-2.5 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Generate Preview
          </button>
        </div>
      </div>
    </div>
  );
}
