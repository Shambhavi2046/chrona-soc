import { Network, Search } from "lucide-react";
import SeverityBadge from "@/components/alerts/SeverityBadge";
import ClientDate from "@/components/common/ClientDate";

import { IOC } from "@/services/threat-intel";

interface IOCTableProps {
  iocs: IOC[];
  onSearch?: (query: string) => void;
}

export default function IOCTable({ iocs, onSearch }: IOCTableProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-soc-border flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Network className="w-5 h-5 mr-2 text-soc-accent" />
          Indicators of Compromise (IOCs)
        </h3>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search IOCs..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="bg-soc-bg border border-soc-border rounded-lg pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-soc-accent transition-colors"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Indicator Value</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Severity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Detected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {iocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 mb-3 opacity-50" />
                    <p>No indicators found</p>
                  </div>
                </td>
              </tr>
            ) : (
              iocs.map((ioc) => (
                <tr key={ioc.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-xs font-medium text-gray-300">
                      {ioc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-gray-300 group-hover:text-white transition-colors">
                    {ioc.value}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-300">{ioc.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <SeverityBadge score={ioc.severity} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm flex items-center ${
                      ioc.status === 'Blocked' ? 'text-soc-success' : 
                      ioc.status === 'Active' ? 'text-soc-danger' : 'text-soc-warning'
                    }`}>
                      {ioc.status === 'Active' && <span className="w-2 h-2 rounded-full bg-soc-danger mr-2 animate-pulse"></span>}
                      {ioc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    <ClientDate date={ioc.lastDetected} format="full" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
