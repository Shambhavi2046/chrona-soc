import { AlertTriangle } from "lucide-react";

export default function MockModeBanner({ moduleName }: { moduleName: string }) {
  return (
    <div className="bg-soc-danger/20 border border-soc-danger text-soc-danger px-4 py-3 rounded-lg flex items-center mb-6">
      <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
      <div>
        <p className="font-semibold text-sm">Development Mock Mode</p>
        <p className="text-xs opacity-90 mt-0.5">
          The backend services for {moduleName} are scheduled for a future implementation phase. This module is currently using local fallback data and is not connected to the live database.
        </p>
      </div>
    </div>
  );
}
