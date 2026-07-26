"use client";

import { RefreshCcw, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      setIsRefreshing(false);
    });
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isPending || isRefreshing}
      className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      {isPending || isRefreshing ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RefreshCcw className="w-4 h-4 mr-2" />
      )}
      {isPending || isRefreshing ? "Refreshing..." : "Refresh"}
    </button>
  );
}
