import { getCaseById } from "@/services";
import CaseDetailHeader from "@/components/cases/CaseDetailHeader";
import InvestigationTimeline from "@/components/cases/InvestigationTimeline";
import EvidenceBoard from "@/components/cases/EvidenceBoard";
import AIResponseCard from "@/components/cases/AIResponseCard";
import RiskAssessmentCard from "@/components/cases/RiskAssessmentCard";
import ThreatContextCard from "@/components/cases/ThreatContextCard";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    caseId: string;
  }>;
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { caseId } = await params;

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let caseDetail;
  try {
    caseDetail = await getCaseById(caseId, token);
  } catch (e) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      <CaseDetailHeader caseDetail={caseDetail} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <RiskAssessmentCard risk={caseDetail.risk_assessment} />
        </div>
        <div className="lg:col-span-2">
          <ThreatContextCard threat={caseDetail.threat_context} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Investigation Flow */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <InvestigationTimeline timeline={caseDetail.timeline} />
          <EvidenceBoard evidence={caseDetail.evidence} />
        </div>

        {/* Right Column - Evidence and AI */}
        <div className="flex flex-col gap-8">
          <AIResponseCard
            summary={caseDetail.ai_summary}
            recommendations={caseDetail.ai_recommendations}
          />

          {/* Enhancement Blocks */}
          <div className="glass-card rounded-xl p-6 border border-soc-border space-y-6">

            {/* MITRE & Alerts */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Alert & MITRE Context</h3>
              <div className="space-y-2">
                <div className="text-xs text-gray-400">MITRE Tactics</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {caseDetail.mitre_tactics.map((t, idx) => (
                    <span key={idx} className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-xs font-mono text-soc-accent">{t}</span>
                  ))}
                </div>

                <div className="text-xs text-gray-400">Linked Alerts</div>
                {caseDetail.linked_alerts.map((a, idx) => (
                  <div key={idx} className="text-sm text-gray-200 bg-soc-bg p-2 rounded border border-soc-border flex justify-between">
                    <span>{a.threat_type}</span>
                    <span className="text-soc-danger font-mono font-bold">{a.risk_score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assets & Related Cases */}
            <div className="pt-4 border-t border-soc-border">
              <div className="space-y-2">
                <div className="text-xs text-gray-400">Affected Assets</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {caseDetail.affected_assets.map((asset, idx) => (
                    <span key={idx} className="px-2 py-1 bg-soc-bg border border-soc-border rounded text-xs font-mono text-gray-300">{asset}</span>
                  ))}
                </div>

                <div className="text-xs text-gray-400">Related Cases</div>
                {caseDetail.related_cases.map((rc, idx) => (
                  <div key={idx} className="text-sm text-gray-200 bg-soc-bg p-2 rounded border border-soc-border flex justify-between items-center cursor-pointer hover:border-soc-accent transition-colors">
                    <span className="truncate flex-1 pr-2">CASE-{rc.id}: {rc.title}</span>
                    <span className="text-xs font-bold text-gray-400">{rc.status}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
