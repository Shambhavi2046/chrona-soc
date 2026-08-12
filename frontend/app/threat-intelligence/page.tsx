"use client";

import { useState, useEffect, useCallback } from "react";
import { Network, RefreshCcw, Radio } from "lucide-react";
import ThreatStatsComponent from "@/components/threat-intelligence/ThreatStats";
import IOCTable from "@/components/threat-intelligence/IOCTable";
import { getIOCs, getThreatStats, IOC, ThreatStats } from "@/services/threat-intel";

export default function ThreatIntelligencePage() {
  const [iocs, setIocs] = useState<IOC[]>([]);
  const [stats, setStats] = useState<ThreatStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      const [iocsData, statsData] = await Promise.all([
        getIOCs(search),
        getThreatStats(),
      ]);
      setIocs(iocsData);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load threat intelligence data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(searchQuery);
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery, fetchData]);

  const handleRefresh = () => {
    fetchData(searchQuery);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soc-text-primary tracking-tight flex items-center">
            <Network className="w-6 h-6 mr-3 text-soc-accent" />
            Threat Intelligence
          </h1>
          <p className="text-sm text-soc-text-secondary mt-1">
            Monitor indicators, attack patterns, and emerging threats
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-soc-text-muted">Live Global Feed</span>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-soc-text-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Sync Intel
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-soc-danger/10 border border-soc-danger text-soc-danger rounded-xl">
          <p>{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <ThreatStatsComponent
        activeThreats={stats?.activeThreats || 0}
        criticalIndicators={stats?.criticalIndicators || 0}
        blockedIocs={stats?.blockedIocs || 0}
        threatScore={stats?.threatScore || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main IOC Table */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <IOCTable iocs={iocs} onSearch={setSearchQuery} />
        </div>
        
        {/* Activity Feed Placeholder */}
        <div className="flex flex-col h-full">
          <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border-t-2 border-t-soc-warning/50">
            <div className="p-6 border-b border-soc-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-soc-text-primary flex items-center">
                <Radio className="w-5 h-5 mr-2 text-soc-warning" />
                Global Threat Activity
              </h3>
            </div>
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center text-soc-text-muted">
              <Radio className="w-8 h-8 mb-4 opacity-50" />
              <p className="text-sm">Threat Activity feed ingestion engine is not yet connected.</p>
              <p className="text-xs mt-2 opacity-75">Scheduled for Milestone 3.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
