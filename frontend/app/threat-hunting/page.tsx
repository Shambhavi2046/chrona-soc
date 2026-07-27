"use client";

import { useState, useEffect } from "react";
import MockModeBanner from "@/components/common/MockModeBanner";
import ModuleHeader from "@/components/common/ModuleHeader";
import { Target, RefreshCw, Download, Save, Plus } from "lucide-react";
import SummaryCards from "@/components/threat-hunting/SummaryCards";
import SearchBar from "@/components/threat-hunting/SearchBar";
import FilterPanel from "@/components/threat-hunting/FilterPanel";
import QueryBuilder from "@/components/threat-hunting/QueryBuilder";
import MitrePanel from "@/components/threat-hunting/MitrePanel";
import IOCHuntPanel from "@/components/threat-hunting/IOCHuntPanel";
import AISuggestions from "@/components/threat-hunting/AISuggestions";
import SavedHunts from "@/components/threat-hunting/SavedHunts";
import ResultsTable from "@/components/threat-hunting/ResultsTable";
import TimelineView from "@/components/threat-hunting/TimelineView";
import EventDrawer from "@/components/threat-hunting/EventDrawer";
import { HuntEvent, SavedHunt, HuntQueryRequest } from "@/types";
import { getSavedHunts, executeHunt, createSavedHunt, deleteSavedHunt, updateSavedHunt } from "@/services/hunting";

export default function ThreatHuntingWorkspace() {
  const [selectedEvent, setSelectedEvent] = useState<HuntEvent | null>(null);
  
  // State
  const [events, setEvents] = useState<HuntEvent[]>([]);
  const [savedHunts, setSavedHunts] = useState<SavedHunt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<HuntQueryRequest>({});

  const fetchSavedHunts = async () => {
    try {
      const data = await getSavedHunts();
      setSavedHunts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecute = async (queryReq: HuntQueryRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await executeHunt(queryReq);
      setEvents(res.events);
      setCurrentQuery(queryReq);
    } catch (err: any) {
      setError(err.message || "Failed to execute hunt.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedHunts();
    handleExecute({}); // Run empty hunt on load
  }, []);

  const handleRunSavedHunt = (hunt: SavedHunt) => {
    const q = { query: hunt.query };
    setCurrentQuery(q);
    handleExecute(q);
  };

  const handleDeleteSavedHunt = async (id: string) => {
    try {
      await deleteSavedHunt(id);
      fetchSavedHunts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameSavedHunt = async (id: string, newName: string) => {
    try {
      await updateSavedHunt(id, { name: newName });
      fetchSavedHunts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHunt = async () => {
    try {
      await createSavedHunt({
        name: `New Hunt ${new Date().toLocaleTimeString()}`,
        query: currentQuery.query || "",
        author: "admin",
      });
      fetchSavedHunts();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "hunt_results.json");
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const updateQuery = (updates: Partial<HuntQueryRequest>) => {
    setCurrentQuery(prev => ({ ...prev, ...updates }));
  };

  const updateAndRun = (updates: Partial<HuntQueryRequest>) => {
    const newQ = { ...currentQuery, ...updates };
    setCurrentQuery(newQ);
    handleExecute(newQ);
  };

  const clearWorkspace = () => {
    setCurrentQuery({});
    setEvents([]);
    setSelectedEvent(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Threat Hunting Workspace"
        subtitle="Search across telemetry, identify suspicious activity and investigate hidden threats."
        icon={Target}
        actions={[
          { label: "Refresh", icon: RefreshCw, onClick: () => handleExecute(currentQuery) },
          { label: "Export", icon: Download, onClick: handleExport },
          { label: "Save Hunt", icon: Save, variant: "outline", onClick: handleSaveHunt },
          { label: "New Hunt", icon: Plus, variant: "primary", onClick: clearWorkspace }
        ]}
      />
      
      {/* Summary KPI Cards */}
      <SummaryCards events={events} />
      
      {/* Search & Filters */}
      <div className="space-y-4">
        <SearchBar query={currentQuery} onUpdate={updateQuery} onSearch={(updates) => updateAndRun(updates || {})} />
        <FilterPanel query={currentQuery} onUpdate={updateQuery} onRun={(updates) => updateAndRun(updates || {})} />
      </div>

      {/* Query Builder (mocked visual) */}
      <QueryBuilder query={currentQuery} onUpdate={updateQuery} onRun={(updates) => updateAndRun(updates || {})} />

      {/* Threat Intel Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MitrePanel onApply={(tactic, technique) => {
          const newQ = { ...currentQuery, mitre_tactic: tactic, mitre_technique: technique };
          setCurrentQuery(newQ);
          handleExecute(newQ);
        }} />
        <IOCHuntPanel onApply={(ioc) => {
          const newQ = { ...currentQuery, ioc };
          setCurrentQuery(newQ);
          handleExecute(newQ);
        }} />
      </div>

      {/* Copilot Suggestions */}
      <AISuggestions onApply={(q) => {
        const newQ = { ...currentQuery, query: q };
        setCurrentQuery(newQ);
        handleExecute(newQ);
      }} />

      {/* Saved Hunts */}
      <SavedHunts 
        hunts={savedHunts} 
        onRun={handleRunSavedHunt} 
        onDelete={handleDeleteSavedHunt} 
        onRename={handleRenameSavedHunt}
      />

      {/* Results & Timeline Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {error && <div className="text-red-400 p-4 bg-soc-card border border-red-900 rounded mb-4">{error}</div>}
          {isLoading ? (
            <div className="text-center p-8 text-gray-400 glass-card">Executing query...</div>
          ) : events.length === 0 ? (
            <div className="text-center p-8 text-gray-400 glass-card">No events found matching the criteria.</div>
          ) : (
            <ResultsTable 
              events={events} 
              onRowClick={(evt) => setSelectedEvent(evt)} 
            />
          )}
        </div>
        <div className="xl:col-span-1">
          <TimelineView events={events} />
        </div>
      </div>

      {/* Drawer Overlay for Event Details */}
      <EventDrawer 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}
