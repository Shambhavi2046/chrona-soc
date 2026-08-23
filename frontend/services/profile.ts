import { fetchApi } from "./api";
import { API_URL } from "./config";
import { AdminUser } from "./admin";

export interface ProfileUpdate {
  name?: string;
}

export async function getMyProfile(): Promise<AdminUser> {
  const response = await fetchApi(`${API_URL}/users/me`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
}

export async function updateMyProfile(data: ProfileUpdate): Promise<AdminUser> {
  const response = await fetchApi(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
}

export async function changePassword(data: any): Promise<{ message: string }> {
  const response = await fetchApi(`${API_URL}/users/me/password`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to update password");
  }
  return response.json();
}
