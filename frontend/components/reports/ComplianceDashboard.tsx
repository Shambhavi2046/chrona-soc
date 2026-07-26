import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function ComplianceDashboard() {
  return (
    <div className="glass-card border border-soc-border rounded-xl p-6 h-full flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6 text-center">Overall Compliance Posture</h3>
      
      <div className="flex justify-center items-center mb-8">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="96" cy="96" r="88" className="stroke-soc-bg" strokeWidth="12" fill="none" />
            <circle 
              cx="96" cy="96" r="88" 
              className="stroke-emerald-500 transition-all duration-1000 ease-out" 
              strokeWidth="12" 
              fill="none" 
              strokeDasharray="552.92" 
              strokeDashoffset={552.92 - (552.92 * 0.89)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white">89%</span>
            <span className="text-sm text-emerald-400 mt-1 font-medium">Compliant</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Passed Controls</span>
          </div>
          <span className="text-lg font-bold text-white">644</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span className="text-sm font-medium text-red-400">Failed Controls</span>
          </div>
          <span className="text-lg font-bold text-white">35</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Pending Review</span>
          </div>
          <span className="text-lg font-bold text-white">12</span>
        </div>
      </div>
    </div>
  );
}
