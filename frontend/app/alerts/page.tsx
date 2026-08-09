export const dynamic = 'force-dynamic';

import { getAlerts } from "@/services";
import AlertTable from "@/components/alerts/AlertTable";
import { ShieldAlert } from "lucide-react";
import { Suspense } from "react";
import RefreshButton from "@/components/common/RefreshButton";

export default async function AlertsPage() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Fetch real alerts from backend
  const alerts = await getAlerts(token);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <ShieldAlert className="w-6 h-6 mr-3 text-soc-danger" />
            Security Alerts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time threat detection feed and automated analysis results
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Live Feed Active</span>
          <RefreshButton />
        </div>
      </div>

      {/* Main Alerts Table */}
      <div className="w-full">
        <Suspense fallback={<div className="h-64 w-full bg-soc-card rounded-xl border border-soc-border animate-pulse" />}>
          <AlertTable alerts={alerts} />
        </Suspense>
      </div>
    </div>
  );
}
