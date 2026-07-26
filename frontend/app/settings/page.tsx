"use client";

import { useState } from "react";
import MockModeBanner from "@/components/common/MockModeBanner";
import ModuleHeader from "@/components/common/ModuleHeader";
import { Settings, Save, RotateCcw } from "lucide-react";
import SettingsSidebar, { SettingsTab } from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import AICopilotSettings from "@/components/settings/AICopilotSettings";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import SystemPreferences from "@/components/settings/SystemPreferences";
import DataBackupSettings from "@/components/settings/DataBackupSettings";
import AboutSettings from "@/components/settings/AboutSettings";

import { mockProfile, mockDevices, mockIntegrationStatuses, mockHealth } from "@/lib/mocks/settings";

export default function SettingsWorkspace() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings profile={mockProfile} />;
      case "security":
        return <SecuritySettings devices={mockDevices} />;
      case "notifications":
        return <NotificationSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "copilot":
        return <AICopilotSettings />;
      case "integrations":
        return <IntegrationSettings integrations={mockIntegrationStatuses} />;
      case "system":
        return <SystemPreferences />;
      case "backup":
        return <DataBackupSettings />;
      case "about":
        return <AboutSettings health={mockHealth} />;
      default:
        return <ProfileSettings profile={mockProfile} />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Platform Settings"
        subtitle="Manage your account, security, preferences, integrations, and system configuration."
        icon={Settings}
        actions={[
          { label: "Reset Defaults", icon: RotateCcw },
          { label: "Save Changes", icon: Save, variant: "primary" }
        ]}
      />

      <MockModeBanner moduleName="Platform Settings" />

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
