import { useState, useEffect } from "react";
import { Shield, Key, Smartphone, Laptop, Clock, LogOut, Loader2, Globe, Monitor, Trash2 } from "lucide-react";
import { getSessions, revokeSession, UserSession } from "@/services/auth";

export default function SecuritySettings() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      setRevokingId(id);
      await revokeSession(id);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      {/* Password & MFA */}
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">Security & Access</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Manage your password, 2FA, and authentication methods.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between opacity-50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-medium text-soc-text-primary">Two-Factor Authentication</h4>
              </div>
              <p className="text-xs text-emerald-500 font-medium">Coming Soon</p>
            </div>
            <button disabled className="px-3 py-1.5 bg-soc-card border border-soc-border rounded text-xs font-medium text-soc-text-primary cursor-not-allowed">Configure</button>
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
        </div>

        {error && (
          <div className="mb-6 p-3 bg-soc-danger/10 border border-soc-danger/30 rounded-lg text-soc-danger text-sm flex items-center">
            <span className="mr-2">⚠</span> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-soc-accent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-soc-text-secondary border border-dashed border-soc-border rounded-lg">
            No active sessions found.
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isMobile = session.device_info?.toLowerCase().includes("mobile");
              const date = new Date(session.created_at).toLocaleString();
              
              return (
                <div key={session.id} className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-soc-card rounded-lg">
                      {isMobile ? <Smartphone className="w-5 h-5 text-soc-accent" /> : <Monitor className="w-5 h-5 text-soc-accent" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-soc-text-primary flex items-center gap-2">
                        {session.device_info || "Unknown Device"}
                      </h4>
                      <p className="text-xs text-soc-text-muted mt-1 flex items-center gap-2">
                        <span><Globe className="w-3 h-3 inline mr-1"/>{session.ip_address || "Unknown IP"}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span><Clock className="w-3 h-3 inline mr-1"/>{date}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={() => handleRevoke(session.id)}
                      disabled={revokingId === session.id}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center disabled:opacity-50"
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                      )}
                      Revoke
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
