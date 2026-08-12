import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { PlaybookNode } from "@/types/soar";
import { CredentialResponse, listCredentials } from "@/services/credentials";

function IntegrationCredentialSelector({ provider, value, onChange }: { provider: string, value: string, onChange: (val: string) => void }) {
  const [credentials, setCredentials] = useState<CredentialResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCredentials().then(data => {
      setCredentials(data.filter(c => c.provider === provider));
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [provider]);

  return (
    <div>
      <label className="block text-xs font-medium text-soc-text-secondary mb-1">Credential</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
      >
        <option value="">Select a credential...</option>
        {credentials.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {loading && <p className="text-xs text-soc-text-muted mt-1">Loading credentials...</p>}
      {!loading && credentials.length === 0 && <p className="text-xs text-red-400 mt-1">No credentials found for this provider. Add one in settings.</p>}
    </div>
  );
}

interface NodeConfigModalProps {
  node: PlaybookNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedNode: PlaybookNode) => void;
}

export default function NodeConfigModal({ node, isOpen, onClose, onSave }: NodeConfigModalProps) {
  const [formData, setFormData] = useState<PlaybookNode | null>(null);

  useEffect(() => {
    if (isOpen && node) {
      setFormData(JSON.parse(JSON.stringify(node))); // Deep clone
    } else {
      setFormData(null);
    }
  }, [isOpen, node]);

  if (!isOpen || !formData) return null;

  const handleConfigChange = (key: string, value: any) => {
    setFormData((prev) => prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev);
  };

  const handleSave = () => {
    if (formData) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-soc-bg border border-soc-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="px-6 py-4 border-b border-soc-border bg-soc-card flex items-center justify-between">
          <h2 className="text-lg font-bold text-soc-text-primary">Configure Node</h2>
          <button onClick={onClose} className="p-1.5 text-soc-text-secondary hover:text-soc-text-primary hover:bg-soc-bg rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-soc-text-secondary mb-1">Title</label>
            <input
              type="text"
              value={formData.title || ""}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
              >
                <option value="Trigger">Trigger</option>
                <option value="Action">Action</option>
                <option value="Integration">Integration</option>
                <option value="Decision">Decision</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-soc-text-secondary mb-1">Action Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary focus:outline-none focus:border-soc-accent"
              >
                <option value="log">Log</option>
                <option value="set_variable">Set Variable</option>
                <option value="condition">Condition</option>
                <option value="http_request">HTTP Request</option>
                <option value="integration">Integration</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-soc-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-soc-text-secondary">Configuration</h3>
              {['Action', 'Integration'].includes(formData.category) && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-soc-text-secondary">Retries:</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.config?.retries || 0}
                    onChange={e => handleConfigChange("retries", parseInt(e.target.value) || 0)}
                    className="w-16 bg-soc-card border border-soc-border rounded px-2 py-1 text-soc-text-primary text-xs focus:outline-none focus:border-soc-accent"
                  />
                </div>
              )}
            </div>

            {formData.type === "integration" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Integration Provider</label>
                  <select
                    value={formData.config?.integration || "threatfox"}
                    onChange={e => handleConfigChange("integration", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  >
                    <option value="threatfox">ThreatFox</option>
                  </select>
                </div>
                <IntegrationCredentialSelector
                  provider={formData.config?.integration || "threatfox"}
                  value={formData.config?.credential_id || ""}
                  onChange={(val) => handleConfigChange("credential_id", val)}
                />
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">IOC (Variable or String)</label>
                  <input
                    type="text"
                    value={formData.config?.ioc || ""}
                    onChange={e => handleConfigChange("ioc", e.target.value)}
                    placeholder="e.g. {{alert.ioc}} or 1.1.1.1"
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
              </div>
            )}

            {formData.type === "log" && (
              <div>
                <label className="block text-xs font-medium text-soc-text-secondary mb-1">Message</label>
                <input
                  type="text"
                  value={formData.config?.message || ""}
                  onChange={e => handleConfigChange("message", e.target.value)}
                  className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                />
              </div>
            )}

            {formData.type === "set_variable" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Variable Name</label>
                  <input
                    type="text"
                    value={formData.config?.name || ""}
                    onChange={e => handleConfigChange("name", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Value (String/JSON)</label>
                  <input
                    type="text"
                    value={typeof formData.config?.value === 'object' ? JSON.stringify(formData.config.value) : String(formData.config?.value || "")}
                    onChange={e => {
                      let val = e.target.value;
                      if (val === 'true') val = true as any;
                      if (val === 'false') val = false as any;
                      handleConfigChange("value", val);
                    }}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
              </div>
            )}

            {formData.type === "condition" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Variable Name</label>
                  <input
                    type="text"
                    value={formData.config?.variable || ""}
                    onChange={e => handleConfigChange("variable", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Operator</label>
                  <select
                    value={formData.config?.operator || "equals"}
                    onChange={e => handleConfigChange("operator", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  >
                    <option value="equals">Equals</option>
                    <option value="not_equals">Not Equals</option>
                    <option value="contains">Contains</option>
                    <option value="exists">Exists</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Expected Value</label>
                  <input
                    type="text"
                    value={String(formData.config?.value || "")}
                    onChange={e => {
                      let val = e.target.value;
                      if (val === 'true') val = true as any;
                      if (val === 'false') val = false as any;
                      handleConfigChange("value", val);
                    }}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
              </div>
            )}

            {formData.type === "http_request" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">URL</label>
                  <input
                    type="text"
                    value={formData.config?.url || ""}
                    onChange={e => handleConfigChange("url", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-soc-text-secondary mb-1">Method</label>
                    <select
                      value={formData.config?.method || "GET"}
                      onChange={e => handleConfigChange("method", e.target.value)}
                      className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-soc-text-secondary mb-1">Timeout (s)</label>
                    <input
                      type="number"
                      value={formData.config?.timeout || 10}
                      onChange={e => handleConfigChange("timeout", parseFloat(e.target.value))}
                      className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-soc-text-secondary mb-1">Body (JSON String)</label>
                  <textarea
                    value={typeof formData.config?.body === 'object' ? JSON.stringify(formData.config.body) : (formData.config?.body || "")}
                    onChange={e => handleConfigChange("body", e.target.value)}
                    className="w-full bg-soc-card border border-soc-border rounded-lg px-3 py-2 text-soc-text-primary text-sm focus:outline-none focus:border-soc-accent min-h-[60px]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-soc-border bg-soc-card flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-soc-bg border border-soc-border hover:border-gray-500 rounded-lg text-sm font-medium text-soc-text-secondary transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-lg">
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </>
  );
}
