import { Network, RefreshCcw } from "lucide-react";
import ThreatStats from "@/components/threat-intelligence/ThreatStats";
import IOCTable, { IOC } from "@/components/threat-intelligence/IOCTable";
import ThreatActivityCard from "@/components/threat-intelligence/ThreatActivityCard";
import MockModeBanner from "@/components/common/MockModeBanner";

// Realistic mock data structured for future API integration
const MOCK_IOCS: IOC[] = [
  {
    id: "IOC-1092",
    type: "IP",
    value: "185.15.22.1",
    category: "Command and Control",
    severity: 95,
    status: "Active",
    lastDetected: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "IOC-1091",
    type: "Domain",
    value: "secure-auth-update.net",
    category: "Phishing",
    severity: 85,
    status: "Active",
    lastDetected: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "IOC-1090",
    type: "Hash",
    value: "a3b9...4f1c",
    category: "Ransomware Payload",
    severity: 100,
    status: "Blocked",
    lastDetected: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "IOC-1089",
    type: "IP",
    value: "45.33.12.90",
    category: "Botnet Scanner",
    severity: 60,
    status: "Monitoring",
    lastDetected: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

const MOCK_FEED = [
  {
    id: "F-1",
    source: "ChronaAI Network Sensor",
    message: "New C2 infrastructure detected targeting financial sectors.",
    time: "2 mins ago",
    isHighPriority: true,
  },
  {
    id: "F-2",
    source: "Global Threat Intel Feed",
    message: "Suspicious DNS tunneling activities observed globally.",
    time: "14 mins ago",
    isHighPriority: false,
  },
  {
    id: "F-3",
    source: "Endpoint Agent",
    message: "Multiple ransomware payloads blocked matching known signatures.",
    time: "45 mins ago",
    isHighPriority: true,
  },
  {
    id: "F-4",
    source: "ChronaAI Analytics",
    message: "Baseline deviation established for remote access protocols.",
    time: "1 hr ago",
    isHighPriority: false,
  },
];

export default function ThreatIntelligencePage() {
  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <MockModeBanner moduleName="Threat Intelligence" />
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center">
            <Network className="w-6 h-6 mr-3 text-soc-accent" />
            Threat Intelligence
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Monitor indicators, attack patterns, and emerging threats
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">Live Global Feed</span>
          <button className="flex items-center px-4 py-2 bg-soc-card hover:bg-soc-card-hover border border-soc-border text-white text-sm font-medium rounded-lg transition-colors">
            <RefreshCcw className="w-4 h-4 mr-2" />
            Sync Intel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <ThreatStats
        activeThreats={24}
        criticalIndicators={8}
        blockedIocs={142}
        threatScore={78}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main IOC Table */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <IOCTable iocs={MOCK_IOCS} />
        </div>
        
        {/* Activity Feed */}
        <div className="flex flex-col h-full">
          <ThreatActivityCard feed={MOCK_FEED} />
        </div>
      </div>
    </div>
  );
}
