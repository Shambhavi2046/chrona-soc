import { API_URL } from "./config";
import { GraphTopology } from "@/types";

export async function getGraphTopology(): Promise<GraphTopology> {
  try {
    const response = await fetch(`${API_URL}/graph`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch graph topology");
    return await response.json();
  } catch (error) {
    console.warn("Graph API unavailable, falling back to mock mode");
    return {
      nodes: [
        { id: "1", type: "threat", data: { label: "External Attacker", status: "critical" } },
        { id: "2", type: "asset", data: { label: "Firewall (DMZ)", status: "warning" } },
        { id: "3", type: "asset", data: { label: "Web Server", status: "critical" } },
        { id: "4", type: "asset", data: { label: "Database", status: "secure" } }
      ],
      edges: [
        { id: "e1-2", source: "1", target: "2", type: "default", label: "Port Scan" },
        { id: "e2-3", source: "2", target: "3", type: "default", label: "HTTP Exploit" },
        { id: "e3-4", source: "3", target: "4", type: "default", label: "SQLi Attempt" }
      ]
    };
  }
}
