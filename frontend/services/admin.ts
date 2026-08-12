import { fetchApi } from "./api";
import { API_URL } from "./config";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  org_id: string;
  status: string;
  mfa_enabled: boolean;
  roles: { id: string; name: string }[];
  created_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_system?: boolean;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await fetchApi(`${API_URL}/users`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}

export async function createAdminUser(payload: any): Promise<AdminUser> {
  const response = await fetchApi(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

export async function updateAdminUser(id: string, payload: any): Promise<AdminUser> {
  const response = await fetchApi(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
}

export async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetchApi(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete user");
}

export async function getAdminRoles(): Promise<AdminRole[]> {
  const response = await fetchApi(`${API_URL}/roles`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch roles");
  return response.json();
}

export async function createAdminRole(payload: any): Promise<AdminRole> {
  const response = await fetchApi(`${API_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to create role");
  return response.json();
}

export async function updateAdminRole(id: string, payload: any): Promise<AdminRole> {
  const response = await fetchApi(`${API_URL}/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Failed to update role");
  return response.json();
}
