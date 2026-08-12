"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Case } from "@/types";
import { Search, Filter, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import ClientDate from "@/components/common/ClientDate";
import { useSearchParams, useRouter } from "next/navigation";
import { User, getUsers } from "@/services/users";

interface CasesTableProps {
  cases: Case[];
}

export default function CasesTable({ cases }: CasesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const globalQuery = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  const filteredCases = cases.filter(c => {
    const matchesLocal = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.status.toLowerCase().includes(searchTerm.toLowerCase());
    
    const caseIdStr = `case-${c.id.toString().split('-')[0].toLowerCase()}`;
    const matchesGlobal = !globalQuery || 
                          c.title.toLowerCase().includes(globalQuery) || 
                          c.status.toLowerCase().includes(globalQuery) ||
                          caseIdStr.includes(globalQuery) ||
                          c.id.toString().toLowerCase().includes(globalQuery);

    return matchesLocal && matchesGlobal;
  });

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'new': return 'bg-soc-danger/20 text-soc-danger border-soc-danger';
      case 'open': return 'bg-soc-warning/20 text-soc-warning border-soc-warning';
      case 'investigating': return 'bg-soc-accent/20 text-soc-accent border-soc-accent';
      case 'resolved':
      case 'closed': return 'bg-soc-success/20 text-soc-success border-soc-success';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full border border-soc-border">
      <div className="p-6 border-b border-soc-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-soc-text-primary">Active Cases</h3>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-soc-text-muted" />
            <input 
              type="text" 
              placeholder="Search cases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-soc-bg border border-soc-border rounded-lg pl-9 pr-4 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors"
            />
          </div>
          <button className="px-3 py-2 bg-soc-bg border border-soc-border rounded-lg hover:border-soc-accent transition-colors">
            <Filter className="w-4 h-4 text-soc-text-secondary" />
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-soc-text-secondary text-xs uppercase tracking-wider border-b border-soc-border">
              <th className="px-6 py-4 font-medium">Case ID</th>
              <th className="px-6 py-4 font-medium">Title</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium">Assignee</th>
              <th className="px-6 py-4 font-medium">Created</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-soc-card-hover/50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-soc-text-secondary group-hover:text-soc-accent transition-colors">
                  <Link href={`/cases/${c.id}`}>CASE-{c.id.toString().split('-')[0].toUpperCase()}</Link>
                </td>
                <td className="px-6 py-4">
                  <Link href={`/cases/${c.id}`} className="font-medium text-soc-text-primary group-hover:text-soc-text-primary transition-colors">
                    {c.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm flex items-center ${c.priority === 'High' ? 'text-soc-danger' : 'text-soc-text-secondary'}`}>
                    {c.priority === 'High' && <ShieldAlert className="w-3 h-3 mr-1.5" />}
                    {c.priority}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-soc-text-secondary">
                  <div className="flex flex-col gap-1">
                    {c.assignee || <span className="italic text-soc-text-muted">Unassigned</span>}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <select 
                        className="text-[10px] bg-soc-bg border border-soc-border hover:border-soc-accent rounded px-1 py-0.5 text-soc-text-secondary max-w-[120px] outline-none"
                        value=""
                        onChange={async (e) => {
                          const newAssignee = e.target.value;
                          if (newAssignee && newAssignee !== c.assignee) {
                            try {
                              const { updateCaseStatus } = await import("@/services/cases");
                              await updateCaseStatus(c.id, c.status, newAssignee);
                              router.refresh();
                            } catch (err) {
                              console.error(err);
                              alert("Failed to assign case");
                            }
                          }
                        }}
                      >
                        <option value="" disabled>Assign to...</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-soc-text-muted whitespace-nowrap">
                  <ClientDate date={c.created_at} format="date" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.status.toLowerCase() !== 'closed' && c.status.toLowerCase() !== 'resolved' && (
                      <button 
                        onClick={async () => {
                          try {
                            const { updateCaseStatus } = await import("@/services/cases");
                            await updateCaseStatus(c.id, "Closed", c.assignee || undefined);
                            router.refresh();
                          } catch (e) {
                            console.error(e);
                            alert("Failed to close case");
                          }
                        }}
                        className="text-xs px-2 py-1 bg-soc-bg border border-soc-border hover:border-soc-success text-soc-text-secondary hover:text-soc-success rounded transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-soc-text-muted">
                  No cases found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
