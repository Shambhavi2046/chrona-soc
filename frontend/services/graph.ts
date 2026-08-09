import { API_URL } from "./config";
import { GraphTopology } from "@/types";

export async function getGraphTopology(): Promise<GraphTopology> {
  const response = await fetch(`${API_URL}/graph`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch graph topology: ${response.statusText}`);
  }
  return await response.json();
}
