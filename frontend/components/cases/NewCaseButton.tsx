"use client";

import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCase } from "@/services/cases";

export default function NewCaseButton() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newCase = await createCase({
        title: "New Security Case",
        severity: "Medium",
        priority: "Medium",
        description: "Manually created case for investigation."
      });
      // Redirect to the new case detail page
      router.push(`/cases/${newCase.id}`);
    } catch (e) {
      console.error("Failed to create case", e);
      setIsCreating(false);
    }
  };

  return (
    <button 
      onClick={handleCreate}
      disabled={isCreating}
      className="flex items-center px-4 py-2 bg-soc-accent hover:bg-soc-accent/80 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
    >
      {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
      {isCreating ? "Creating..." : "New Case"}
    </button>
  );
}
