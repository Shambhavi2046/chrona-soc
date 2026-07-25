"use client";

import { Evidence } from "@/lib/api";
import { FileText, Globe, Hash, Link as LinkIcon } from "lucide-react";
import ClientDate from "@/components/common/ClientDate";

interface EvidenceBoardProps {
  evidence: Evidence[];
}

export default function EvidenceBoard({ evidence }: EvidenceBoardProps) {
  const getEvidenceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ip': return <Globe className="w-5 h-5 text-soc-accent" />;
      case 'hash': return <Hash className="w-5 h-5 text-soc-danger" />;
      case 'domain':
      case 'url': return <LinkIcon className="w-5 h-5 text-soc-warning" />;
      case 'pcap':
      case 'log': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'screenshot':
      case 'file': return <FileText className="w-5 h-5 text-blue-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Evidence Board</h3>
        <button className="px-3 py-1 bg-soc-accent hover:bg-soc-accent/80 text-white text-xs font-medium rounded transition-colors">
          + Add Evidence
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evidence.map((item) => (
          <div key={item.id} className="p-4 bg-soc-bg border border-soc-border rounded-lg hover:border-soc-accent/50 transition-colors flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-soc-card rounded">
                  {getEvidenceIcon(item.evidence_type)}
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">{item.evidence_type}</span>
                  <p className="text-sm font-mono text-gray-200 truncate max-w-[200px]" title={item.value}>{item.value}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  item.confidence === 'Critical' ? 'bg-soc-danger/20 text-soc-danger border border-soc-danger' : 
                  item.confidence === 'High' ? 'bg-soc-warning/20 text-soc-warning border border-soc-warning' : 
                  'bg-soc-success/20 text-soc-success border border-soc-success'
                }`}>
                  {item.confidence} Conf
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  <ClientDate date={item.created_at} format="date" />
                </span>
              </div>
            </div>

            {item.description && (
              <p className="text-xs text-gray-400 line-clamp-2 bg-soc-card/50 p-2 rounded border border-soc-border/50">
                {item.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-soc-border text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="font-semibold text-gray-400">Src:</span> {item.source}
              </span>
              <span className="flex items-center gap-1">
                <span className="font-semibold text-gray-400">By:</span> {item.added_by}
              </span>
            </div>
          </div>
        ))}
        {evidence.length === 0 && (
          <div className="col-span-full p-8 text-center text-gray-500 border border-dashed border-soc-border rounded-lg">
            No evidence attached to this case.
          </div>
        )}
      </div>
    </div>
  );
}
