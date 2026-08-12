import { Search, Command, X } from "lucide-react";
import { HuntQueryRequest } from "@/types";

interface Props {
  query: HuntQueryRequest;
  onUpdate: (q: Partial<HuntQueryRequest>) => void;
  onSearch: (q?: Partial<HuntQueryRequest>) => void;
}

export default function SearchBar({ query, onUpdate, onSearch }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch({ query: (e.target as HTMLInputElement).value });
    }
  };

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-soc-accent" />
      </div>
      <input
        type="text"
        className="block w-full pl-12 pr-24 py-4 bg-soc-card border border-soc-border rounded-xl text-soc-text-primary placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-soc-accent focus:border-soc-accent transition-all shadow-sm"
        placeholder="Search logs, IPs, users, processes, hashes, domains..."
        value={query.query || ""}
        onChange={(e) => onUpdate({ query: e.target.value })}
        onKeyDown={handleKeyDown}
      />
      {query.query && (
        <button 
          onClick={() => { onUpdate({ query: "" }); onSearch({ query: "" }); }}
          className="absolute inset-y-0 right-14 pr-3 flex items-center text-soc-text-muted hover:text-soc-text-primary transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <div className="flex items-center text-soc-text-muted text-xs gap-1 border border-soc-border bg-soc-bg px-2 py-1 rounded">
          <Command className="w-3 h-3" />
          <span>Enter</span>
        </div>
      </div>
    </div>
  );
}
