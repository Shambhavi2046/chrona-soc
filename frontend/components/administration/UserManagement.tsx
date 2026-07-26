import { Users, MoreVertical, ShieldCheck, ShieldAlert, Edit2, UserX, Trash2 } from "lucide-react";
import { User } from "@/types";

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-soc-border flex items-center justify-between bg-soc-bg">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-soc-accent" />
          User Directory
        </h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-soc-card border border-soc-border rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-soc-accent"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-soc-bg/50 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Organisation</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">MFA</th>
              <th className="px-6 py-3 font-medium">Last Login</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-soc-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-soc-card-hover transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-white text-sm">{user.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{user.email}</div>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-gray-400">
                  {user.orgId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                  <span className="px-2 py-1 bg-soc-bg border border-soc-border rounded">
                    {user.role}
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
                  {user.mfaEnabled ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-orange-400" />
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                  {user.lastLogin}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button className="p-1.5 text-gray-400 hover:text-white rounded transition-colors group-hover:bg-soc-bg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {/* Hover Actions Menu (Simulated) */}
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-soc-card border border-soc-border rounded-lg shadow-lg p-1 z-10 pointer-events-none group-hover:pointer-events-auto">
                    <button className="p-1.5 text-gray-300 hover:text-white hover:bg-soc-bg rounded transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-gray-300 hover:text-orange-400 hover:bg-soc-bg rounded transition-colors" title="Disable"><UserX className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-soc-bg rounded transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
