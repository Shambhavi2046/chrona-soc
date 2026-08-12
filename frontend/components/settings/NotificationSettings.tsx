import { Bell, Mail, Monitor, MessageSquare, AlertTriangle, FileText } from "lucide-react";

export default function NotificationSettings() {
  const notificationTypes = [
    { id: "email", label: "Email Notifications", icon: Mail, desc: "Receive summary reports and critical alerts via email.", enabled: true },
    { id: "browser", label: "Browser Push", icon: Monitor, desc: "Native browser notifications for real-time events.", enabled: false },
    { id: "slack", label: "Slack Integration", icon: MessageSquare, desc: "Direct messages in Slack for assignments and mentions.", enabled: true },
    { id: "teams", label: "Microsoft Teams", icon: MessageSquare, desc: "Mentions and workflow approvals pushed to MS Teams.", enabled: false },
  ];

  const alertPreferences = [
    { label: "Critical Incidents", desc: "Immediate notification for severity >= 9.0", enabled: true },
    { label: "High Alerts", desc: "Standard notification for severity 7.0 - 8.9", enabled: true },
    { label: "Medium Alerts", desc: "Digest only for severity 4.0 - 6.9", enabled: false },
    { label: "Playbook Failures", desc: "When automated SOAR actions encounter errors.", enabled: true },
    { label: "Case Updates", desc: "When cases assigned to you are modified.", enabled: true },
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 animate-in fade-in duration-300 space-y-10">
      
      <section>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-soc-text-primary">Notifications</h2>
          <p className="text-sm text-soc-text-secondary mt-1">Configure how and when you want to be alerted across channels.</p>
        </div>

        <h3 className="text-sm font-bold text-soc-text-primary mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-soc-accent" /> Delivery Channels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notificationTypes.map((channel) => (
            <div key={channel.id} className="p-4 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-soc-card rounded-lg">
                  <channel.icon className="w-4 h-4 text-soc-text-secondary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-soc-text-primary">{channel.label}</h4>
                  <p className="text-xs text-soc-text-muted mt-0.5">{channel.desc}</p>
                </div>
              </div>
              <button className={`w-8 h-4 rounded-full relative transition-colors ${channel.enabled ? 'bg-soc-accent' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${channel.enabled ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-soc-text-primary mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-soc-accent" /> Alert Preferences</h3>
        <div className="space-y-3">
          {alertPreferences.map((pref, idx) => (
            <div key={idx} className="p-3 bg-soc-bg border border-soc-border rounded-lg flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-soc-text-primary">{pref.label}</h4>
                <p className="text-xs text-soc-text-muted mt-0.5">{pref.desc}</p>
              </div>
              <button className={`w-8 h-4 rounded-full relative transition-colors ${pref.enabled ? 'bg-soc-accent' : 'bg-gray-700'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${pref.enabled ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold text-soc-text-primary mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-soc-accent" /> Automated Reports</h3>
        <div className="p-4 bg-soc-bg border border-soc-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium text-soc-text-primary">Daily SOC Summary Digest</h4>
            <p className="text-xs text-soc-text-muted mt-1">Receive a compiled PDF of overnight activity at 08:00 AM.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-emerald-400">Subscribed</span>
            <button className="px-3 py-1.5 bg-soc-card hover:bg-soc-border border border-soc-border rounded text-xs font-medium text-soc-text-primary transition-colors">Manage Schedule</button>
          </div>
        </div>
      </section>

    </div>
  );
}
