import { getGraphTopology } from "@/services";
import MockModeBanner from "@/components/common/MockModeBanner";
import AttackGraphViewer from "@/components/attack-graph/AttackGraphViewer";
import { Network, ShieldAlert, Cpu } from "lucide-react";

export const metadata = {
  title: 'Attack Graph | Chrona SOC',
  description: 'Interactive infrastructure and attack path visualization',
};

export default async function AttackGraphPage() {
  const topology = await getGraphTopology();
  
  // Calculate quick stats
  const totalAssets = topology.nodes.filter(n => n.type === 'asset').length;
  const totalAlerts = topology.nodes.filter(n => n.type === 'alert').length;
  const totalActors = topology.nodes.filter(n => n.type === 'threat_actor').length;

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 flex flex-col h-[calc(100vh-theme(spacing.16))] max-w-[1920px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center">
            <Network className="w-6 h-6 mr-3 text-soc-accent" />
            Attack Graph & Topology
          </h1>
          <p className="text-gray-400 text-sm">Visualize infrastructure relationships, active threats, and attack paths.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center px-4 py-2 bg-soc-bg border border-soc-border rounded-lg">
            <Cpu className="w-4 h-4 text-soc-success mr-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Assets</span>
              <span className="text-sm font-mono font-bold text-white">{totalAssets}</span>
            </div>
          </div>
          <div className="flex items-center px-4 py-2 bg-soc-bg border border-soc-border rounded-lg">
            <ShieldAlert className="w-4 h-4 text-soc-danger mr-2" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Alerts</span>
              <span className="text-sm font-mono font-bold text-white">{totalAlerts}</span>
            </div>
          </div>
        </div>
      </div>
      
      <MockModeBanner moduleName="Attack Graph" />
      
      <div className="flex-1 w-full relative">
        <AttackGraphViewer topology={topology} />
      </div>
    </div>
  );
}
