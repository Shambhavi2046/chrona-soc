import { Home, CalendarClock, Globe, SaveAll } from "lucide-react";

export default function SystemPreferences() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">System Preferences</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Configure default behaviors and regional formatting.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-soc-text-primary flex items-center gap-2"><Home className="w-4 h-4 text-soc-accent" /> Default Startup</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-soc-text-secondary">Default Landing Page</label>
              <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
                <option>Dashboard</option>
                <option>Alerts Queue</option>
                <option>My Active Cases</option>
                <option>Threat Hunting</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-soc-text-secondary">Default Time Range</label>
              <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Today</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-soc-text-secondary">Auto Refresh Interval</label>
              <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
                <option>1 Minute</option>
                <option>5 Minutes</option>
                <option>15 Minutes</option>
                <option>Manual Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-soc-text-primary flex items-center gap-2"><Globe className="w-4 h-4 text-soc-accent" /> Regional & Formatting</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-soc-text-secondary">Date Format</label>
              <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
                <option>YYYY-MM-DD (ISO 8601)</option>
                <option>DD/MM/YYYY (UK/EU)</option>
                <option>MM/DD/YYYY (US)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-soc-text-secondary">Time Format</label>
              <select className="w-full bg-soc-bg border border-soc-border rounded-lg px-3 py-2 text-sm text-soc-text-primary focus:outline-none focus:border-soc-accent transition-colors">
                <option>24-hour (14:30)</option>
                <option>12-hour (02:30 PM)</option>
              </select>
            </div>

            <div className="p-4 mt-2 bg-soc-bg border border-soc-border rounded-lg flex items-start gap-3">
              <CalendarClock className="w-5 h-5 text-soc-text-secondary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-soc-text-primary">Log Retention Policy</h4>
                <p className="text-xs text-soc-text-muted mt-1">Audit logs and inactive alerts are automatically archived to cold storage after 90 days per enterprise policy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
