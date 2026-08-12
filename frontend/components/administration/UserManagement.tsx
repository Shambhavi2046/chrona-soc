import { Users, MoreVertical, ShieldCheck, ShieldAlert, Edit2, UserX, Trash2, Plus, X } from "lucide-react";
import { useState } from "react";
import { AdminUser, createAdminUser, updateAdminUser, deleteAdminUser } from "@/services/admin";

interface UserManagementProps {
  users: AdminUser[];
  onRefresh?: () => void;
}

export default function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<AdminUser | null>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "", status: "Active" });
  const [loading, setLoading] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createAdminUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        status: "Active",
        role_ids: []
      });
      setShowCreateModal(false);
      setFormData({ name: "", email: "", password: "", status: "Active" });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to create user.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    try {
      setLoading(true);
      await updateAdminUser(showEditModal.id, {
        name: formData.name,
        status: formData.status
      });
      setShowEditModal(null);
      setFormData({ name: "", email: "", password: "", status: "Active" });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to edit user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (id: string) => {
    if (!confirm("Are you sure you want to disable this user?")) return;
    try {
      setLoading(true);
      await updateAdminUser(id, { status: "Disabled" });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to disable user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      setLoading(true);
      await deleteAdminUser(id);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      alert("Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setFormData({ name: user.name, email: user.email, password: "", status: user.status });
    setShowEditModal(user);
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full relative">
      <div className="p-4 border-b border-soc-border flex items-center justify-between bg-soc-bg">
        <h3 className="font-semibold text-soc-text-primary flex items-center gap-2">
          <Users className="w-5 h-5 text-soc-accent" />
          User Directory
        </h3>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-soc-accent hover:bg-soc-accent/80 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create User
        </button>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-soc-text-secondary text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Organisation</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">MFA</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-soc-text-muted text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-soc-card-hover transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-soc-text-primary text-sm">{user.name}</div>
                    <div className="text-xs text-soc-text-muted mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-soc-text-secondary">
                    {user.org_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-soc-text-secondary">
                    <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded">
                      {user.roles?.[0]?.name || "No Role"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center text-xs font-medium ${
                      user.status === 'Active' ? 'text-emerald-400' :
                      user.status === 'Disabled' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.mfa_enabled ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-orange-400" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-soc-text-secondary whitespace-nowrap">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary rounded transition-colors group-hover:bg-soc-bg">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {/* Hover Actions Menu */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-soc-card border border-soc-border rounded-lg shadow-lg p-1 z-10 pointer-events-none group-hover:pointer-events-auto">
                      <button onClick={() => openEditModal(user)} disabled={loading} className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary hover:bg-soc-bg rounded transition-colors disabled:opacity-50" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDisable(user.id)} disabled={loading} className="p-1.5 text-soc-text-secondary hover:text-orange-400 hover:bg-soc-bg rounded transition-colors disabled:opacity-50" title="Disable"><UserX className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(user.id)} disabled={loading} className="p-1.5 text-soc-text-secondary hover:text-red-400 hover:bg-soc-bg rounded transition-colors disabled:opacity-50" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal Overlay */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-soc-bg border border-soc-border rounded-xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-soc-border">
              <h3 className="text-soc-text-primary font-medium">Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-soc-text-secondary hover:text-soc-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Password</label>
                <input required minLength={8} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" placeholder="••••••••" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-soc-text-secondary hover:text-soc-text-primary">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/80 text-white text-sm font-medium rounded transition-colors disabled:opacity-50">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {showEditModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-soc-bg border border-soc-border rounded-xl w-full max-w-md shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-soc-border">
              <h3 className="text-soc-text-primary font-medium">Edit User: {showEditModal.email}</h3>
              <button onClick={() => setShowEditModal(null)} className="text-soc-text-secondary hover:text-soc-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary">
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowEditModal(null)} className="px-4 py-2 text-sm font-medium text-soc-text-secondary hover:text-soc-text-primary">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-soc-accent hover:bg-soc-accent/80 text-white text-sm font-medium rounded transition-colors disabled:opacity-50">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
