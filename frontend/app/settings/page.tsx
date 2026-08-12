"use client";

import { useState } from "react";
import ModuleHeader from "@/components/common/ModuleHeader";
import { Settings } from "lucide-react";
import SettingsSidebar, { SettingsTab } from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import AboutSettings from "@/components/settings/AboutSettings";

export default function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "about":
        return <AboutSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Platform Settings"
        subtitle="Manage your account, appearance, and view system information."
        icon={Settings}
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0">
          <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Active Content Panel */}
        <div className="flex-1 min-w-0">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
