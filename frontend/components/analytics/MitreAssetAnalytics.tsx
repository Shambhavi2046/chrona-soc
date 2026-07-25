"use client";

import { Zap, Server } from "lucide-react";

interface MitreAssetAnalyticsProps {
  topTactics: Array<{ tactic: string; count: number }>;
  assetRisk: Array<{ asset: string; riskScore: number; incidents: number }>;
}

export default function MitreAssetAnalytics({ topTactics, assetRisk }: MitreAssetAnalyticsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* MITRE Top Tactics */}
      <div className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center">
          <Zap className="w-5 h-5 text-soc-warning mr-2" />
          <h3 className="text-lg font-semibold text-white">MITRE ATT&CK Tactics</h3>
        </div>
        <div className="space-y-4">
          {topTactics.map((t, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300 font-medium">{t.tactic}</span>
                <span className="text-soc-warning font-mono">{t.count} hits</span>
              </div>
              <div className="w-full bg-soc-bg rounded-full h-2">
                <div 
                  className="bg-soc-warning h-2 rounded-full" 
                  style={{ width: `${Math.min((t.count / Math.max(...topTactics.map(x=>x.count))) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High Risk Assets */}
      <div className="glass-card rounded-xl p-6">
        <div className="mb-6 flex items-center">
          <Server className="w-5 h-5 text-soc-danger mr-2" />
          <h3 className="text-lg font-semibold text-white">Highest Risk Assets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-soc-border">
                <th className="pb-3 font-medium">Asset Name</th>
                <th className="pb-3 font-medium text-center">Incidents</th>
                <th className="pb-3 font-medium text-right">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soc-border/50">
              {assetRisk.map((asset, idx) => (
                <tr key={idx} className="group">
                  <td className="py-3 font-mono text-sm text-gray-300 group-hover:text-white transition-colors">
                    {asset.asset}
                  </td>
                  <td className="py-3 text-sm text-gray-400 text-center">
                    {asset.incidents}
                  </td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      asset.riskScore >= 80 ? 'bg-soc-danger/20 text-soc-danger' : 
                      asset.riskScore >= 50 ? 'bg-soc-warning/20 text-soc-warning' : 
                      'bg-soc-success/20 text-soc-success'
                    }`}>
                      {asset.riskScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
