import { ShieldAlert, Search } from "lucide-react";

export default function IOCHuntPanel() {
  const iocTypes = ["IP", "Hash", "Domain", "URL", "Email", "File Name"];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4 text-white font-medium">
        <ShieldAlert className="w-5 h-5 text-soc-accent" />
        Quick IOC Search
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <select className="bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-soc-accent">
            {iocTypes.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input 
              type="text" 
              placeholder="Enter indicator..." 
              className="w-full pl-9 pr-3 py-2 bg-soc-bg border border-soc-border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-soc-accent" 
            />
          </div>
        </div>
        <button className="w-full py-2 bg-soc-card hover:bg-soc-accent/10 border border-soc-border hover:border-soc-accent rounded-lg text-sm font-medium text-soc-accent transition-colors">
          Search Telemetry
        </button>
      </div>
    </div>
  );
}
