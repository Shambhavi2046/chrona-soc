import { getCases } from "@/services";
import CasesTable from "@/components/cases/CasesTable";
import CaseKPIs from "@/components/cases/CaseKPIs";
import { Briefcase, Plus } from "lucide-react";

export default async function CasesDashboardPage() {
  const cases = await getCases();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Briefcase className="w-6 h-6 mr-3 text-soc-accent" />
            Case Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Enterprise incident response, evidence tracking, and SLA monitoring
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-soc-accent hover:bg-soc-accent/80 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      <CaseKPIs cases={cases} />

      <div className="h-[600px]">
        <CasesTable cases={cases} />
      </div>
    </div>
  );
}
