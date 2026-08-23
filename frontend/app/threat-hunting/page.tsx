"use client";

import { useState, useEffect } from "react";

import ModuleHeader from "@/components/common/ModuleHeader";
import { Target, RefreshCw, Download, Save, Plus, CheckCircle2 } from "lucide-react";
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
  const [totalCount, setTotalCount] = useState(0);
  const [savedHunts, setSavedHunts] = useState<SavedHunt[]>([]);
  const [savedHuntsError, setSavedHuntsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<HuntQueryRequest>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHuntName, setNewHuntName] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isNewHunt, setIsNewHunt] = useState(false);
  const [currentHuntName, setCurrentHuntName] = useState<string | null>(null);

  const fetchSavedHunts = async () => {
    setSavedHuntsError(null);
    try {
      const data = await getSavedHunts();
      setSavedHunts(data);
    } catch (err: any) {
      console.error("fetchSavedHunts error:", err);
      setSavedHuntsError(err.message || "Failed to load saved hunts.");
    }
  };

  const handleExecute = async (queryReq: HuntQueryRequest) => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await executeHunt(queryReq);
      setEvents(res.events);
      setTotalCount(res.total || 0);
      setCurrentQuery({
        ...queryReq,
        page: res.page || queryReq.page || 1,
        page_size: res.page_size || queryReq.page_size || 50
      });
      if (res.events.length === 0) setSuccessMsg("Execution Succeeded: 0 matches found.");
      else setSuccessMsg(`Execution Succeeded: ${res.events.length} matches found.`);
    } catch (err: any) {
      console.error("handleExecute error:", err);
      setError(err.message || "Failed to execute hunt.");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedHunts();
    handleExecute({}); // Run empty hunt on load
  }, []);

  const handleRunSavedHunt = async (hunt: SavedHunt) => {
    let q: HuntQueryRequest = { page: 1 };
    try {
      if (hunt.query && hunt.query.trim().startsWith('{')) {
        const parsed = JSON.parse(hunt.query);
        if (typeof parsed === 'object' && parsed !== null) {
          q = { ...parsed, page: 1 };
        } else {
          q = { query: hunt.query, page: 1 };
        }
      } else {
        q = { query: hunt.query, page: 1 };
      }
    } catch {
      // Fallback for old plain-text hunts or empty strings
      q = { query: hunt.query, page: 1 };
    }

    setCurrentQuery(q);
    handleExecute(q);
    setIsNewHunt(false);
    setCurrentHuntName(hunt.name);

    try {
      await updateSavedHunt(hunt.id, { last_run: new Date().toISOString() });
      fetchSavedHunts();
    } catch (err) {
      console.error("Failed to update last_run", err);
    }
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

  const handleSaveHunt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newHuntName.trim()) return;
    try {
      const queryToSave = { ...currentQuery };
      delete queryToSave.page;
      delete queryToSave.page_size;
      delete queryToSave.sort_by;
      delete queryToSave.sort_desc;
      
      const serializedQuery = JSON.stringify(queryToSave);
      const mitre_mapping = currentQuery.mitre_technique || currentQuery.mitre_tactic || undefined;

      await createSavedHunt({
        name: newHuntName,
        query: serializedQuery,
        mitre_mapping: mitre_mapping,
        author: "admin",
      });
      setIsModalOpen(false);
      const savedName = newHuntName;
      setNewHuntName("");
      fetchSavedHunts();
      setSuccessMsg("Hunt saved successfully.");
      setIsNewHunt(false);
      setCurrentHuntName(savedName);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save hunt.");
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
    // Reset to page 1 when search/filter changes
    const newQ = { ...currentQuery, ...updates, page: 1 };
    setCurrentQuery(newQ);
    handleExecute(newQ);
  };

  const handlePageChange = (newPage: number) => {
    const newQ = { ...currentQuery, page: newPage };
    setCurrentQuery(newQ);
    handleExecute(newQ);
  };

  const startNewHunt = () => {
    setCurrentQuery({});
    setEvents([]);
    setSelectedEvent(null);
    setSuccessMsg(null);
    setError(null);
    setIsNewHunt(true);
    setCurrentHuntName(null);
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
          { label: "Save Hunt", icon: Save, variant: "outline", onClick: () => { setNewHuntName(""); setIsModalOpen(true); } },
          { label: "New Hunt", icon: Plus, variant: "primary", onClick: startNewHunt }
        ]}
      />

      {/* Visual State Indicator */}
      {isNewHunt && !currentHuntName && (
        <div className="bg-soc-accent/10 border border-soc-accent/50 text-soc-accent px-4 py-3 rounded-lg flex items-center mb-6 animate-in fade-in slide-in-from-top-2">
          <span className="font-bold mr-2 text-soc-text-primary">Unsaved Hunt:</span> Configure your query parameters and click Save Hunt when finished.
        </div>
      )}
      {currentHuntName && (
        <div className="bg-soc-bg border border-soc-border px-4 py-3 rounded-lg flex items-center mb-6 animate-in fade-in slide-in-from-top-2">
          <span className="font-bold mr-2 text-soc-text-secondary">Active Hunt:</span> <span className="text-soc-text-primary">{currentHuntName}</span>
        </div>
      )}

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
        const newQ = { ...currentQuery, query: q, page: 1 };
        setCurrentQuery(newQ);
        handleExecute(newQ);
      }} />

      {/* Saved Hunts */}
      <SavedHunts
        hunts={savedHunts}
        error={savedHuntsError}
        onRun={handleRunSavedHunt}
        onDelete={handleDeleteSavedHunt}
        onRename={handleRenameSavedHunt}
      />

      {/* Results & Timeline Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          {error && <div className="text-red-400 p-4 bg-soc-card border border-red-900 rounded mb-4">{error}</div>}
          {successMsg && <div className="text-green-400 p-4 bg-soc-card border border-green-900 rounded mb-4 flex items-center"><CheckCircle2 className="w-5 h-5 mr-2" />{successMsg}</div>}
          {isLoading ? (
            <div className="text-center p-8 text-soc-text-secondary glass-card">Executing query...</div>
          ) : events.length === 0 ? (
            <div className="text-center p-8 text-soc-text-secondary glass-card">No events found matching the criteria. Execution was successful.</div>
          ) : (
            <ResultsTable
              events={events}
              onRowClick={(evt) => setSelectedEvent(evt)}
              total={totalCount}
              currentPage={currentQuery.page || 1}
              pageSize={currentQuery.page_size || 50}
              onPageChange={handlePageChange}
            />
          )}
        </div>
        <div className="xl:col-span-1">
          <TimelineView events={events} />
        </div>
      </div>

      {/* New Hunt / Save Hunt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-soc-bg border border-soc-border rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold text-soc-text-primary mb-4">Save Hunt</h3>
            <form onSubmit={handleSaveHunt}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-soc-text-secondary mb-1">Hunt Name</label>
                  <input
                    type="text"
                    required
                    value={newHuntName}
                    onChange={(e) => setNewHuntName(e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
                    placeholder="e.g. Suspicious Logins"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-soc-text-secondary hover:text-soc-text-primary transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/90 text-white text-sm font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)]">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer Overlay for Event Details */}
      <EventDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
