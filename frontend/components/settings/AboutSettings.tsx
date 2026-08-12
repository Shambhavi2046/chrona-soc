import { Shield, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

export default function AboutSettings() {
  const health = {
    version: "2.4.1",
    build: "b-89122x",
    environment: "Production",
    license: "Enterprise",
    status: "Healthy",
    uptime: "Online",
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300">
      
      <div className="flex flex-col items-center justify-center py-10 border-b border-soc-border mb-8">
        <div className="w-20 h-20 rounded-2xl bg-soc-accent/10 border border-soc-accent/30 flex items-center justify-center mb-6 relative group">
          <div className="absolute inset-0 bg-soc-accent blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl" />
          <Shield className="w-10 h-10 text-soc-accent relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-soc-text-primary tracking-wide">Chrona SOC</h2>
        <p className="text-sm text-soc-text-secondary mt-2 text-center max-w-md">Enterprise-grade, AI-powered Security Operations Center platform for modern threat detection and response.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-bold text-soc-text-muted uppercase tracking-wider mb-4">System Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-soc-text-secondary">Version</span>
              <span className="text-soc-text-primary font-medium">{health.version}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-soc-text-secondary">Build Number</span>
              <span className="text-soc-text-primary font-mono text-xs mt-0.5">{health.build}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-soc-text-secondary">Environment</span>
              <span className="text-emerald-400 font-medium">{health.environment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-soc-text-secondary">License</span>
              <span className="text-soc-accent font-medium">{health.license}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-soc-border/50">
              <span className="text-soc-text-secondary">System Status</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {health.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-soc-text-secondary">Uptime</span>
              <span className="text-soc-text-secondary">{health.uptime}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-soc-text-muted uppercase tracking-wider mb-4">Resources & Legal</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-soc-bg/50 border border-soc-border/50 rounded-lg text-soc-text-muted cursor-not-allowed" title="Currently unavailable">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-soc-text-muted" />
                <span className="text-sm">Release Notes (v2.4.1)</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-soc-text-muted">Unavailable</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-soc-bg/50 border border-soc-border/50 rounded-lg text-soc-text-muted cursor-not-allowed" title="Currently unavailable">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-soc-text-muted" />
                <span className="text-sm">Documentation & API</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-soc-text-muted">Unavailable</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-soc-bg/50 border border-soc-border/50 rounded-lg text-soc-text-muted cursor-not-allowed" title="Currently unavailable">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-soc-text-muted" />
                <span className="text-sm">Privacy Policy & EULA</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-soc-text-muted">Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-soc-text-muted mt-10">
        &copy; {new Date().getFullYear()} Chrona SOC Systems Inc. All rights reserved.
      </div>
    </div>
  );
}
