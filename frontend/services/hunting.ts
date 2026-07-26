import { API_URL } from "./config";
import { SavedHunt, HuntQueryRequest, HuntExecuteResponse } from "@/types";

export async function getSavedHunts(skip: number = 0, limit: number = 100): Promise<SavedHunt[]> {
  const response = await fetch(`${API_URL}/hunting/saved?skip=${skip}&limit=${limit}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch saved hunts");
  return response.json();
}

export async function createSavedHunt(data: Partial<SavedHunt>): Promise<SavedHunt> {
  const response = await fetch(`${API_URL}/hunting/saved`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create saved hunt");
  return response.json();
}

export async function deleteSavedHunt(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/hunting/saved/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete saved hunt");
}

export async function executeHunt(request: HuntQueryRequest): Promise<HuntExecuteResponse> {
  const response = await fetch(`${API_URL}/hunting/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error("Failed to execute hunt query");
  return response.json();
}
