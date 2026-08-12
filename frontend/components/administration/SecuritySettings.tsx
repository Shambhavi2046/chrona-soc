import { ShieldCheck, Key, Clock, Settings2 } from "lucide-react";

export default function SecuritySettings() {
  const policies = [
    { title: "Multi-Factor Authentication", desc: "Require MFA for all users.", icon: ShieldCheck, status: "Enforced", color: "text-emerald-400" },
    { title: "Password Policy", desc: "Min 14 chars, complex, 90-day rotation.", icon: Key, status: "Configured", color: "text-blue-400" },
    { title: "Session Timeout", desc: "Auto-logout after 15 mins of inactivity.", icon: Clock, status: "15 mins", color: "text-purple-400" },
    { title: "SSO Configuration", desc: "SAML 2.0 Identity Provider integration.", icon: Settings2, status: "Azure AD", color: "text-orange-400" },
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-soc-text-primary font-medium">
          <ShieldCheck className="w-5 h-5 text-soc-accent" />
          Security Policies
        </div>
        <button className="text-xs text-soc-accent hover:text-soc-text-primary transition-colors">
          Configure
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {policies.map((policy, idx) => (
          <div key={idx} className="bg-soc-bg border border-soc-border hover:border-soc-accent/50 rounded-lg p-4 transition-all group">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <policy.icon className={`w-4 h-4 ${policy.color}`} />
                <h4 className="text-sm font-medium text-soc-text-primary">{policy.title}</h4>
              </div>
            </div>
            <p className="text-xs text-soc-text-muted mb-3">{policy.desc}</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-soc-text-secondary font-medium">{policy.status}</span>
              <button className="text-soc-accent opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
