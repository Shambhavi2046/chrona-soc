"use client";

import { useState, useEffect } from "react";
import { Network, Plus, Trash2, Shield } from "lucide-react";
import { listCredentials, createCredential, deleteCredential, CredentialResponse } from "../../services/credentials";

export default function IntegrationSettings() {
  const [credentials, setCredentials] = useState<CredentialResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");

  const fetchCredentials = async () => {
    try {
      const data = await listCredentials();
      setCredentials(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !secret) return;
    setLoading(true);
    try {
      await createCredential({ name, provider: "threatfox", secret });
      setShowAddForm(false);
      setName("");
      setSecret("");
      await fetchCredentials();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCredential(id);
      await fetchCredentials();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-soc-text-primary flex items-center gap-2">
            <Network className="w-5 h-5 text-soc-accent" />
            Integration Credentials
          </h2>
          <p className="text-sm text-soc-text-secondary mt-1">Manage API keys for SOAR integrations securely.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center px-4 py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Credential
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="mb-6 bg-soc-bg border border-soc-border rounded-lg p-4">
          <h3 className="text-sm font-bold text-soc-text-primary mb-4">Add ThreatFox API Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-soc-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ThreatFox Prod Key"
                className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-soc-text-secondary mb-1">API Key</label>
              <input
                type="password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-soc-card border border-soc-border rounded px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-sm text-soc-text-secondary hover:text-soc-text-primary transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-1.5 bg-soc-accent hover:bg-blue-600 rounded text-sm text-white transition-colors">
              {loading ? "Saving..." : "Save Credential"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {credentials.length === 0 && !showAddForm && (
          <div className="text-sm text-soc-text-muted text-center py-8">No credentials configured.</div>
        )}
        {credentials.map((cred) => (
          <div key={cred.id} className="bg-soc-bg border border-soc-border rounded-lg p-4 flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-soc-card border border-soc-border flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-soc-text-primary">{cred.name}</h4>
                <div className="text-xs text-soc-text-muted flex gap-2">
                  <span>Provider: <span className="text-soc-text-secondary font-medium capitalize">{cred.provider}</span></span>
                  <span>•</span>
                  <span>Created: {new Date(cred.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(cred.id)}
              className="p-2 text-soc-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
              title="Delete Credential"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
