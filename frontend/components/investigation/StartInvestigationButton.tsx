"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInvestigation } from "@/services/investigations";
import { PlayCircle } from "lucide-react";

export default function StartInvestigationButton({ alertId }: { alertId: string }) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStart = async () => {
    setIsCreating(true);
    setError(null);

    try {
      await createInvestigation({ alert_id: alertId });
      // Successfully created, refresh to load the new data
      router.refresh();
    } catch (err: any) {
      // If we hit a duplicate constraint/conflict, or it already exists, just refresh the page
      const errorMessage = err?.message || String(err);
      if (
        errorMessage.toLowerCase().includes("exists") ||
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.includes("500") // SQLAlchemy UniqueViolation often surfaces as 500
      ) {
        // Assume it might have been created by a race condition, try refreshing
        router.refresh();
      } else {
        setError("Failed to start investigation. Please try again.");
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleStart}
        disabled={isCreating}
        className="flex items-center px-6 py-3 bg-soc-accent hover:bg-soc-accent/90 text-white font-medium rounded-lg transition-colors shadow-[0_0_15px_rgba(56,189,248,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlayCircle className="w-5 h-5 mr-2" />
        {isCreating ? "Starting Investigation..." : "Start Investigation"}
      </button>
      {error && (
        <p className="text-soc-danger text-sm mt-3 font-medium">{error}</p>
      )}
    </div>
  );
}
