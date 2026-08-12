import { Shield, Key, Smartphone, Laptop, Clock, LogOut } from "lucide-react";
import { SecurityDevice } from "@/types";

interface SecuritySettingsProps {
  devices: SecurityDevice[];
}

export default function SecuritySettings({ devices }: SecuritySettingsProps) {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      {/* Password & MFA */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">Security & Access</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Manage your password, 2FA, and authentication methods.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Key className="w-4 h-4 text-soc-accent" />
                <h4 className="text-sm font-medium text-soc-text-primary">Change Password</h4>
              </div>
              <p className="text-xs text-soc-text-muted">Last changed 42 days ago</p>
            </div>
            <button className="px-3 py-1.5 bg-soc-card hover:bg-soc-border border border-soc-border rounded text-xs font-medium text-soc-text-primary transition-colors">Update</button>
          </div>

          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-medium text-soc-text-primary">Two-Factor Authentication</h4>
              </div>
              <p className="text-xs text-emerald-500 font-medium">Enabled (Authenticator App)</p>
            </div>
            <button className="px-3 py-1.5 bg-soc-card hover:bg-soc-border border border-soc-border rounded text-xs font-medium text-soc-text-primary transition-colors">Configure</button>
          </div>
        </div>
      </section>

      {/* Active Sessions */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-md font-bold text-soc-text-primary">Active Sessions</h3>
            <p className="text-sm text-soc-text-secondary mt-1">Devices currently logged into your account.</p>
          </div>
          <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Sign out all other sessions
          </button>
        </div>

        <div className="space-y-3">
          {devices.map((device) => (
            <div key={device.id} className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-soc-card rounded-lg">
                  {device.name.includes("iPhone") ? <Smartphone className="w-5 h-5 text-soc-text-secondary" /> : <Laptop className="w-5 h-5 text-soc-text-secondary" />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-soc-text-primary flex items-center gap-2">
                    {device.name}
                    {device.isCurrent && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Current</span>}
                  </h4>
                  <p className="text-xs text-soc-text-muted mt-1 flex items-center gap-2">
                    <span>{device.location}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span>{device.ip}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-soc-text-muted flex items-center"><Clock className="w-3 h-3 mr-1" /> {device.lastActive}</span>
                {!device.isCurrent && (
                  <button className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Developer Tokens */}
      <section>
        <div className="mb-6">
          <h3 className="text-md font-bold text-soc-text-primary">Developer Settings</h3>
        </div>
        <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-soc-text-primary">Personal Access Tokens</h4>
            <p className="text-xs text-soc-text-muted mt-1">Generate tokens for API access. (2 Active)</p>
          </div>
          <button className="px-3 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-xs font-medium text-white transition-colors">Manage Tokens</button>
        </div>
      </section>

    </div>
  );
}
