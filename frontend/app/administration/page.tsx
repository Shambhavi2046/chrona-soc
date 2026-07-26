"use client";

import ModuleHeader from "@/components/common/ModuleHeader";
import { Users, RefreshCw, ShieldPlus, UserPlus } from "lucide-react";
import SummaryCards from "@/components/administration/SummaryCards";
import OrganisationManagement from "@/components/administration/OrganisationManagement";
import UserManagement from "@/components/administration/UserManagement";
import RolesPermissions from "@/components/administration/RolesPermissions";
import TeamManagement from "@/components/administration/TeamManagement";
import AuditLog from "@/components/administration/AuditLog";
import ActiveSessions from "@/components/administration/ActiveSessions";
import SecuritySettings from "@/components/administration/SecuritySettings";
import Analytics from "@/components/administration/Analytics";

import { 
  mockOrganisations, 
  mockUsers, 
  mockTeams, 
  mockAuditLogs, 
  mockSessions 
} from "@/lib/mocks/admin";

import MockModeBanner from "@/components/common/MockModeBanner";

export default function AdministrationWorkspace() {
  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Administration"
        subtitle="Manage organisations, users, roles and permissions."
        icon={Users}
        actions={[
          { label: "Refresh", icon: RefreshCw },
          { label: "Create Role", icon: ShieldPlus },
          { label: "Invite User", icon: UserPlus, variant: "primary" }
        ]}
      />

      <MockModeBanner moduleName="Administration" />

      {/* Summary KPI Cards */}
      <SummaryCards />

      {/* Security Policies & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SecuritySettings />
        <Analytics />
      </div>

      {/* Organisation Management */}
      <OrganisationManagement organisations={mockOrganisations} />

      {/* Users and Teams */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 h-[450px]">
          <UserManagement users={mockUsers} />
        </div>
        <div className="xl:col-span-1 h-[450px] overflow-y-auto">
          <TeamManagement teams={mockTeams} />
        </div>
      </div>

      {/* Roles & Permissions Builder */}
      <div className="h-[500px]">
        <RolesPermissions />
      </div>

      {/* Logs & Sessions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[500px]">
        <div className="xl:col-span-2 h-full">
          <AuditLog logs={mockAuditLogs} />
        </div>
        <div className="xl:col-span-1 h-full">
          <ActiveSessions sessions={mockSessions} />
        </div>
      </div>

    </div>
  );
}
