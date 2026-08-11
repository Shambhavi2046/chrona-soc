import { fetchApi } from "./api";

export interface IOC {
  id: string;
  type: "IP" | "Domain" | "Hash" | string;
  value: string;
  category: string;
  severity: number;
  status: "Active" | "Blocked" | "Monitoring" | string;
  lastDetected: string;
}

export interface ThreatStats {
  activeThreats: number;
  criticalIndicators: number;
  blockedIocs: number;
  threatScore: number;
}

export async function getIOCs(search?: string): Promise<IOC[]> {
  const url = search ? `/threat-intel/iocs?search=${encodeURIComponent(search)}` : "/threat-intel/iocs";
  const response = await fetchApi(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch IOCs: ${response.statusText}`);
  }
  
  // Map backend structure to frontend structure
  const data = await response.json();
  return data.map((item: any) => ({
    id: item.id,
    type: item.type,
    value: item.value,
    category: item.category || "Uncategorized",
    severity: item.confidence,
    status: item.status,
    lastDetected: item.created_at,
  }));
}

export async function getThreatStats(): Promise<ThreatStats> {
  const response = await fetchApi("/threat-intel/stats");
  if (!response.ok) {
    throw new Error(`Failed to fetch Threat Stats: ${response.statusText}`);
  }
  return response.json();
}
