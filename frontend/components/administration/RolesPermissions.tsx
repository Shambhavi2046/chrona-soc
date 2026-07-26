import { Shield, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

export default function RolesPermissions() {
  const [activeRole, setActiveRole] = useState("SOC Manager");

  const roles = [
    "Super Admin",
    "SOC Manager",
    "Tier 1 Analyst",
    "Tier 2 Analyst",
    "Threat Hunter",
    "Incident Responder",
    "Auditor",
    "Read Only"
  ];

  const permissions = [
    { category: "Alerts & Cases", items: ["View Alerts", "Triage Alerts", "Create Cases", "Close Cases"] },
    { category: "Threat Intelligence", items: ["View Indicators", "Add Indicators", "Manage Feeds"] },
    { category: "SOAR & Automation", items: ["View Playbooks", "Execute Playbooks", "Edit Playbooks", "Manage Integrations"] },
    { category: "Administration", items: ["View Users", "Manage Users", "Manage Roles", "View Audit Logs"] }
  ];

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col md:flex-row h-full">
      {/* Roles List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-soc-border bg-soc-bg flex flex-col max-h-[500px]">
        <div className="p-4 border-b border-soc-border">
          <h3 className="font-semibold text-white flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-soc-accent" />
            Roles
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map((role) => (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                activeRole === role 
                  ? "bg-soc-accent/10 text-soc-accent" 
                  : "text-gray-400 hover:bg-soc-card hover:text-gray-200"
              }`}
            >
              {role}
              <ChevronRight className={`w-4 h-4 ${activeRole === role ? "text-soc-accent" : "text-gray-600 group-hover:text-gray-400"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="w-full md:w-2/3 flex flex-col bg-soc-card max-h-[500px]">
        <div className="p-4 border-b border-soc-border flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Permissions: {activeRole}</h3>
          <button className="px-3 py-1.5 bg-soc-bg border border-soc-border hover:border-soc-accent rounded text-xs font-medium text-gray-300 hover:text-white transition-colors">
            Save Changes
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {permissions.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{group.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => {
                  // Simulate toggled states based on role name for realism
                  const isEnabled = activeRole === "Super Admin" || activeRole === "SOC Manager" || 
                    (activeRole.includes("Analyst") && !item.includes("Manage"));
                  
                  return (
                    <div key={item} className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg group hover:border-gray-500 transition-colors">
                      <span className="text-sm text-gray-300">{item}</span>
                      <button className={`w-8 h-4 rounded-full relative transition-colors ${isEnabled ? 'bg-soc-accent' : 'bg-gray-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isEnabled ? 'left-4' : 'left-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
