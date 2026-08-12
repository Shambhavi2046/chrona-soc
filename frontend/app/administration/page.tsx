"use client";

import { useState, useEffect, useCallback } from "react";
import ModuleHeader from "@/components/common/ModuleHeader";
import { Users, RefreshCw } from "lucide-react";
import UserManagement from "@/components/administration/UserManagement";
import RolesPermissions from "@/components/administration/RolesPermissions";
import { getAdminUsers, getAdminRoles, AdminUser, AdminRole } from "@/services/admin";

export default function AdministrationWorkspace() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        getAdminUsers(),
        getAdminRoles()
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
    } catch (error) {
      console.error("Failed to load administration data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <ModuleHeader
        title="Administration"
        subtitle="Manage users, roles and permissions for your organization."
        icon={Users}
        actions={[
          { label: "Refresh", icon: RefreshCw, onClick: loadData },
        ]}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soc-accent"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="h-[600px]">
              <UserManagement users={users as any} onRefresh={loadData} />
            </div>
            <div className="h-[600px]">
              <RolesPermissions roles={roles as any} onRefresh={loadData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
