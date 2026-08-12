"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { generateInvestigationsSummary } from "@/services/investigations";

export default function GenerateSummaryButton() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setIsOpen(true);
    try {
      const response = await generateInvestigationsSummary();
      setSummary(response.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-soc-text-primary text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-soc-accent" />
        ) : (
          <Sparkles className="w-4 h-4 mr-2 text-soc-accent" />
        )}
        Generate Summary
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-soc-card border border-soc-border rounded-xl shadow-2xl w-full max-w-lg p-6 m-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-soc-text-primary flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-soc-accent" />
                Overview Summary
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-soc-text-secondary hover:text-soc-text-primary transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="min-h-[100px] flex flex-col justify-center text-sm text-soc-text-secondary bg-soc-bg rounded-lg p-4 border border-soc-border">
              {loading ? (
                <div className="flex flex-col items-center justify-center text-soc-accent">
                  <Loader2 className="w-6 h-6 animate-spin mb-2" />
                  <span>Processing investigation data...</span>
                </div>
              ) : error ? (
                <div className="flex items-start text-soc-danger">
                  <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ) : summary ? (
                <p className="leading-relaxed whitespace-pre-wrap">{summary}</p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-soc-bg hover:bg-soc-bg/80 border border-soc-border text-soc-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
