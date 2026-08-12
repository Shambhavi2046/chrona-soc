import { Download, Upload, Server, ShieldCheck, History } from "lucide-react";

export default function DataBackupSettings() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">Data & Backup</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Manage configuration exports and system restoration points.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-5 bg-soc-bg border border-soc-border rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-soc-card border border-soc-border flex items-center justify-center mb-4">
              <Download className="w-5 h-5 text-soc-accent" />
            </div>
            <h3 className="text-md font-bold text-soc-text-primary mb-2">Export Configuration</h3>
            <p className="text-xs text-soc-text-secondary mb-4 h-12">Download a JSON snapshot of your dashboards, alert rules, and RBAC settings.</p>
            <button className="w-full py-2 bg-soc-accent hover:bg-blue-600 rounded-lg text-sm font-medium text-white transition-colors shadow-sm">
              Generate Export
            </button>
          </div>

          <div className="p-5 bg-soc-bg border border-soc-border rounded-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-10 h-10 rounded-lg bg-soc-card border border-soc-border flex items-center justify-center mb-4 relative z-10">
              <Upload className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-md font-bold text-soc-text-primary mb-2 relative z-10">Restore Configuration</h3>
            <p className="text-xs text-soc-text-secondary mb-4 h-12 relative z-10">Upload a JSON snapshot. <strong className="text-red-400">Warning:</strong> This will overwrite current settings.</p>
            <button className="w-full py-2 bg-soc-card hover:bg-soc-border border border-soc-border rounded-lg text-sm font-medium text-soc-text-primary transition-colors relative z-10">
              Upload Backup File
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-md font-bold text-soc-text-primary mb-4">Automated Backups</h3>
        <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-soc-card rounded-lg mt-0.5"><Server className="w-5 h-5 text-emerald-400" /></div>
            <div>
              <h4 className="text-sm font-medium text-soc-text-primary flex items-center gap-2">Database Snapshot <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></h4>
              <p className="text-xs text-soc-text-muted mt-1">Full system backup completed successfully.</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-1">
            <span className="text-xs text-soc-text-secondary">Last Backup: Today at 03:00 AM</span>
            <span className="text-xs text-soc-text-secondary">Size: 4.2 GB</span>
            <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors flex items-center gap-1 mt-1">
              <History className="w-3.5 h-3.5" /> View Backup History
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
