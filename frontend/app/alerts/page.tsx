import { getAlerts } from "@/lib/api";
import AlertTable from "@/components/alerts/AlertTable";
import { ShieldAlert, RefreshCcw } from "lucide-react";

export default async function AlertsPage() {
  // Fetch real alerts from backend
  const alerts = await getAlerts();

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
          <button className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-white text-sm font-medium rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Alerts Table */}
      <div className="w-full">
        <AlertTable alerts={alerts} />
      </div>
    </div>
  );
}
