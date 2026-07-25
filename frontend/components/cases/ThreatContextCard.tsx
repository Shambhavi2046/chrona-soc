import { ThreatContext } from "@/lib/api";
import { Radar, Skull, Bug, Network, Database, ShieldAlert } from "lucide-react";

interface ThreatContextCardProps {
  threat: ThreatContext | null;
}

export default function ThreatContextCard({ threat }: ThreatContextCardProps) {
  if (!threat) return null;

  return (
    <div className="glass-card rounded-xl p-6 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <Radar className="w-5 h-5 text-soc-accent mr-2" />
        <h3 className="text-lg font-semibold text-white">Threat Context</h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-4">
        
        <div className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg hover:border-soc-accent/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-soc-card rounded group-hover:bg-soc-danger/10 transition-colors">
              <Skull className="w-4 h-4 text-soc-danger" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Threat Actor</span>
              <span className="text-sm font-bold text-gray-200">{threat.actor}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg hover:border-soc-accent/50 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-soc-card rounded group-hover:bg-soc-warning/10 transition-colors">
              <Bug className="w-4 h-4 text-soc-warning" />
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block">Malware Family</span>
              <span className="text-sm font-bold text-gray-200">{threat.malware_family}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-soc-bg border border-soc-border rounded p-3 flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <Network className="w-3 h-3 text-soc-accent" />
              <span className="text-[10px] text-gray-500 uppercase font-mono">Related IOCs</span>
            </div>
            <span className="text-sm font-mono font-bold text-white">{threat.ioc_count}</span>
          </div>
          
          <div className="bg-soc-bg border border-soc-border rounded p-3 flex flex-col">
            <div className="flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3 h-3 text-soc-danger" />
              <span className="text-[10px] text-gray-500 uppercase font-mono">Reputation</span>
            </div>
            <span className={`text-sm font-bold ${threat.reputation === 'Malicious' ? 'text-soc-danger' : 'text-soc-warning'}`}>
              {threat.reputation}
            </span>
          </div>
        </div>

        <div className="bg-soc-bg border border-soc-border rounded p-3 flex flex-col">
          <div className="flex items-center gap-1 mb-1">
            <Database className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] text-gray-500 uppercase font-mono">Feed Source</span>
          </div>
          <span className="text-xs font-mono text-gray-300">{threat.feed_source}</span>
        </div>

        {threat.cves.length > 0 && (
          <div className="mt-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold block mb-2">Known CVEs</span>
            <div className="flex flex-wrap gap-2">
              {threat.cves.map(cve => (
                <span key={cve} className="px-2 py-1 bg-soc-danger/10 border border-soc-danger/30 text-soc-danger text-[10px] font-mono rounded">
                  {cve}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
