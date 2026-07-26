import { getCases } from "@/services";
import CasesTable from "@/components/cases/CasesTable";
import CaseKPIs from "@/components/cases/CaseKPIs";
import { Briefcase } from "lucide-react";
import NewCaseButton from "@/components/cases/NewCaseButton";
import { Suspense } from "react";

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
          <NewCaseButton />
        </div>
      </div>

      <CaseKPIs cases={cases} />

      <div className="h-[600px]">
        <Suspense fallback={<div className="h-full w-full bg-soc-bg rounded-xl border border-soc-border animate-pulse" />}>
          <CasesTable cases={cases} />
        </Suspense>
      </div>
    </div>
  );
}
