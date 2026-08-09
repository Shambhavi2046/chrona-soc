import { fetchApi } from "./api";
import { API_URL } from "./config";
import { GraphTopology } from "@/types";

export async function getGraphTopology(token?: string): Promise<GraphTopology> {
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetchApi(`${API_URL}/graph`, { cache: "no-store", headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch graph topology: ${response.statusText}`);
  }
  return await response.json();
}
