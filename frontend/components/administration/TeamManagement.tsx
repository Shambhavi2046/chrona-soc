import { Users2, Shield, User } from "lucide-react";
import { Team } from "@/types";

interface TeamManagementProps {
  teams: Team[];
}

export default function TeamManagement({ teams }: TeamManagementProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Users2 className="w-5 h-5 text-soc-accent" />
          Security Teams
        </div>
        <button className="text-xs text-soc-accent hover:text-white transition-colors">
          Manage Teams
        </button>
      </div>

      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-soc-accent transition-colors">{team.name}</h4>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{team.id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                team.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
              }`}>
                {team.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-soc-card rounded p-2 border border-soc-border/50">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Members</span>
                <span className="text-sm font-bold text-white flex items-center gap-1"><Users2 className="w-3.5 h-3.5 text-blue-400" /> {team.members}</span>
              </div>
              <div className="bg-soc-card rounded p-2 border border-soc-border/50">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Assigned Cases</span>
                <span className="text-sm font-bold text-white flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-purple-400" /> {team.assignedCases}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-soc-border/50 text-xs">
              <span className="text-gray-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Lead: <span className="text-gray-300 font-medium">{team.lead}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
