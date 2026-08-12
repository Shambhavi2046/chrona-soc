import { Shield, ChevronRight, Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminRole, createAdminRole, updateAdminRole } from "@/services/admin";

interface RolesPermissionsProps {
  roles: AdminRole[];
  onRefresh?: () => void;
}

export default function RolesPermissions({ roles, onRefresh }: RolesPermissionsProps) {
  const [activeRole, setActiveRole] = useState<AdminRole | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  // Local state for permissions edits
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);
  const hasChanges = activeRole && JSON.stringify(activeRole.permissions?.sort() || []) !== JSON.stringify(editedPermissions.sort());

  useEffect(() => {
    if (roles.length > 0 && !activeRole) {
      setActiveRole(roles[0]);
    }
  }, [roles, activeRole]);

  useEffect(() => {
    if (activeRole) {
      setEditedPermissions([...(activeRole.permissions || [])]);
    }
  }, [activeRole]);

  const permissions = [
    { category: "Alerts & Cases", items: ["View Alerts", "Triage Alerts", "Create Cases", "Close Cases"] },
    { category: "Threat Intelligence", items: ["View Indicators", "Add Indicators", "Manage Feeds"] },
    { category: "SOAR & Automation", items: ["View Playbooks", "Execute Playbooks", "Edit Playbooks", "Manage Integrations"] },
    { category: "Administration", items: ["View Users", "Manage Users", "Manage Roles", "View Audit Logs"] }
  ];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newRole = await createAdminRole({
        name: formData.name,
        description: formData.description,
        permissions: []
      });
      setShowCreateModal(false);
      setFormData({ name: "", description: "" });
      onRefresh?.();
      setActiveRole(newRole);
    } catch (err) {
      console.error(err);
      alert("Failed to create role.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeRole) return;
    try {
      setLoading(true);
      await updateAdminRole(activeRole.id, {
        permissions: editedPermissions
      });
      onRefresh?.();
      // The parent refresh will trigger a re-render with updated activeRole properties.
    } catch (err) {
      console.error(err);
      alert("Failed to update role permissions.");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (perm: string) => {
    if (activeRole?.is_system) return;
    if (editedPermissions.includes(perm)) {
      setEditedPermissions(editedPermissions.filter(p => p !== perm));
    } else {
      setEditedPermissions([...editedPermissions, perm]);
    }
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col md:flex-row h-full relative">
      {/* Roles List */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-soc-border bg-soc-bg flex flex-col max-h-[600px]">
        <div className="p-4 border-b border-soc-border flex items-center justify-between">
          <h3 className="font-semibold text-soc-text-primary flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-soc-accent" />
            Roles
          </h3>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 bg-soc-accent hover:bg-soc-accent/80 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                activeRole?.id === role.id 
                  ? "bg-soc-accent/10 text-soc-accent" 
                  : "text-gray-400 hover:bg-soc-card hover:text-gray-200"
              }`}
            >
              {role.name}
              <ChevronRight className={`w-4 h-4 ${activeRole?.id === role.id ? "text-soc-accent" : "text-soc-text-muted group-hover:text-soc-text-secondary"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="w-full md:w-2/3 flex flex-col bg-soc-card max-h-[600px]">
        <div className="p-4 border-b border-soc-border flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-soc-text-primary text-sm">Permissions: {activeRole?.name}</h3>
            {activeRole?.is_system && (
              <span className="text-[10px] uppercase font-bold tracking-wider bg-soc-accent/20 text-soc-accent px-2 py-0.5 rounded">
                System role — permissions cannot be modified
              </span>
            )}
          </div>
          <button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || loading || activeRole?.is_system}
            className="px-3 py-1.5 bg-soc-accent border border-soc-accent disabled:bg-soc-bg disabled:border-soc-border rounded text-xs font-medium text-white disabled:text-soc-text-muted transition-colors"
          >
            Save Changes
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {permissions.map((group) => (
            <div key={group.category}>
              <h4 className="text-xs font-bold text-soc-text-muted uppercase tracking-wider mb-3">{group.category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.items.map((item) => {
                  const isEnabled = editedPermissions.includes(item);
                  return (
                    <div key={item} className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg group hover:border-gray-500 transition-colors">
                      <span className="text-sm text-soc-text-secondary">{item}</span>
                      <button 
                        onClick={() => togglePermission(item)}
                        disabled={activeRole?.is_system}
                        className={`w-8 h-4 rounded-full relative transition-colors ${activeRole?.is_system ? (isEnabled ? 'bg-soc-accent/50' : 'bg-soc-card') : (isEnabled ? 'bg-soc-accent' : 'bg-gray-700')} ${activeRole?.is_system ? 'cursor-not-allowed opacity-70' : ''}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Custom Role Modal Overlay */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-soc-bg border border-soc-border rounded-xl w-full max-w-sm shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-soc-border">
              <h3 className="text-soc-text-primary font-medium">Create Custom Role</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-soc-text-secondary hover:text-soc-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Role Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" placeholder="e.g. Audit Viewer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" placeholder="Optional description" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-soc-text-secondary hover:text-soc-text-primary">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/80 text-white text-sm font-medium rounded transition-colors disabled:opacity-50">Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
