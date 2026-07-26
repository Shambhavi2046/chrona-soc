"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    const params = new URLSearchParams(searchParams);
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        className="block w-full pl-10 pr-3 py-1.5 border border-soc-border rounded-lg leading-5 bg-soc-bg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-soc-accent focus:border-soc-accent sm:text-sm transition-colors"
        placeholder="Search alerts, IPs, domains, hashes..."
      />
    </div>
  );
}

export default function HeaderSearch() {
  return (
    <Suspense fallback={<div className="h-9 w-full max-w-md bg-soc-bg rounded-lg border border-soc-border animate-pulse" />}>
      <SearchInput />
    </Suspense>
  );
}
