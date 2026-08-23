import { User, Shield, Bell, Palette, Bot, Network, Sliders, Database, Info } from "lucide-react";

export type SettingsTab = "profile" | "security" | "appearance" | "about";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security & Sessions", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="glass-card border border-soc-border rounded-xl p-3 flex flex-col gap-1 sticky top-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as SettingsTab)}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
              isActive 
                ? "bg-soc-accent/10 text-soc-accent" 
                : "text-gray-400 hover:bg-soc-card hover:text-gray-200"
            }`}
          >
            <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-soc-accent" : "text-soc-text-muted group-hover:text-soc-text-secondary"}`} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
