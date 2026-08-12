import { getGraphTopology } from "@/services";
import AttackGraphViewer from "@/components/attack-graph/AttackGraphViewer";
import { Network, ShieldAlert, Cpu, AlertTriangle, Database } from "lucide-react";
import { GraphTopology } from "@/types";

export const metadata = {
  title: 'Attack Graph | Chrona SOC',
  description: 'Interactive infrastructure and attack path visualization',
};

export default async function AttackGraphPage() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  let topology: GraphTopology | null = null;
  let errorMsg: string | null = null;

  try {
    topology = await getGraphTopology(token);
  } catch (error: any) {
    errorMsg = error.message || "Failed to load attack graph";
  }

  const isError = errorMsg !== null;
  const isEmpty = !isError && topology && topology.nodes.length === 0;

  // Calculate quick stats
  const totalAssets = topology?.nodes.filter(n => n.type === 'asset').length || 0;
  const totalAlerts = topology?.nodes.filter(n => n.type === 'alert').length || 0;
  const totalActors = topology?.nodes.filter(n => n.type === 'threat_actor').length || 0;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-[1920px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-soc-text-primary mb-1 flex items-center">
            <Network className="w-6 h-6 mr-3 text-soc-accent" />
            Attack Graph & Topology
          </h1>
          <p className="text-soc-text-secondary text-sm">Visualize infrastructure relationships, active threats, and attack paths.</p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center px-4 py-2 bg-soc-bg border border-soc-border rounded-lg">
            <Cpu className="w-4 h-4 text-soc-success mr-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-soc-text-muted font-bold tracking-wider">Assets</span>
              <span className="text-sm font-mono font-bold text-soc-text-primary">{totalAssets}</span>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-soc-bg border border-soc-border rounded-lg">
            <ShieldAlert className="w-4 h-4 text-soc-danger mr-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-soc-text-muted font-bold tracking-wider">Alerts</span>
              <span className="text-sm font-mono font-bold text-soc-text-primary">{totalAlerts}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative bg-soc-bg rounded-lg border border-soc-border overflow-hidden">
        {isError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <AlertTriangle className="w-12 h-12 text-soc-danger mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-soc-text-primary mb-2">API Connection Error</h2>
            <p className="text-soc-muted max-w-md">{errorMsg}</p>
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <Database className="w-12 h-12 text-soc-muted mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-soc-text-primary mb-2">No Topology Data</h2>
            <p className="text-soc-muted max-w-md">There are currently no assets, alerts, or threat intelligence records to visualize in the attack graph.</p>
          </div>
        ) : (
          <AttackGraphViewer topology={topology!} />
        )}
      </div>
    </div>
  );
}
