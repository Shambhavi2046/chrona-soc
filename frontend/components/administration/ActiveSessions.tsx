import { Laptop, Smartphone, Globe2, Clock, XCircle } from "lucide-react";
import { Session } from "@/types";

interface ActiveSessionsProps {
  sessions: Session[];
}

export default function ActiveSessions({ sessions }: ActiveSessionsProps) {
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("iphone") || device.toLowerCase().includes("mobile")) {
      return <Smartphone className="w-4 h-4 text-gray-400" />;
    }
    return <Laptop className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="glass-card border border-soc-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white font-medium">
          <Globe2 className="w-5 h-5 text-soc-accent" />
          Active Sessions
        </div>
        <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
          Revoke All
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto pr-2 max-h-[300px]">
        {sessions.map((session) => (
          <div key={session.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-soc-bg border border-soc-border rounded-lg group hover:border-soc-accent/50 transition-colors gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-soc-card rounded-lg mt-0.5">
                {getDeviceIcon(session.device)}
              </div>
              <div>
                <h4 className="text-sm font-medium text-white">{session.user}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span>{session.device}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{session.browser}</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                  <Globe2 className="w-3 h-3 mr-1" /> {session.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
              <span className={`flex items-center text-xs font-medium ${
                session.status === 'Active' ? 'text-emerald-400' : 'text-yellow-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${session.status === 'Active' ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                {session.status}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" /> {session.loginTime}
              </span>
              <button className="flex items-center text-[10px] text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 sm:mt-1">
                <XCircle className="w-3 h-3 mr-1" /> Revoke
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
