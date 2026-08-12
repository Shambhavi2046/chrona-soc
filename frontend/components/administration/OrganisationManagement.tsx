import { Building2, Users, Calendar, Settings } from "lucide-react";
import { Organisation } from "@/types";

interface OrganisationManagementProps {
  organisations: Organisation[];
}

export default function OrganisationManagement({ organisations }: OrganisationManagementProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <Building2 className="w-5 h-5 text-soc-accent" />
          Tenant Organisations
        </div>
        <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organisations.map((org) => (
          <div key={org.id} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-sm font-bold text-soc-text-primary group-hover:text-soc-accent transition-colors">{org.name}</h4>
                <p className="text-xs text-soc-text-muted font-mono mt-0.5">{org.id}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                org.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                org.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {org.status}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs text-soc-text-secondary">
                <span>Plan</span>
                <span className="text-soc-text-primary font-medium">{org.plan}</span>
              </div>
              <div className="flex justify-between text-xs text-soc-text-secondary">
                <span>Licensed Users</span>
                <span className="text-soc-text-primary flex items-center"><Users className="w-3 h-3 mr-1" /> {org.users}</span>
              </div>
              <div className="flex justify-between text-xs text-soc-text-secondary">
                <span>Created</span>
                <span className="text-soc-text-primary flex items-center"><Calendar className="w-3 h-3 mr-1" /> {org.created}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-soc-border/50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-soc-card hover:bg-soc-bg border border-soc-border hover:border-gray-500 rounded text-xs font-medium text-soc-text-secondary transition-colors">
                <Settings className="w-3.5 h-3.5" /> Manage Tenant
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
