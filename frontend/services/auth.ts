import { fetchApi } from "./api";
import { API_URL } from "./config";

export interface UserSession {
  id: string;
  device_info: string | null;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
  is_revoked: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractErrorMessage(error: any, defaultMsg: string): string {
  if (!error || !error.detail) return defaultMsg;
  if (Array.isArray(error.detail)) {
    const firstError = error.detail[0];
    if (firstError?.type === "value_error.email") {
      return "Please enter a valid email address.";
    }
    return firstError?.msg || defaultMsg;
  }
  if (typeof error.detail === "string") {
    return error.detail;
  }
  return defaultMsg;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(extractErrorMessage(error, "Failed to request password reset"));
  }
  return response.json();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerAccount(data: any): Promise<any> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(extractErrorMessage(error, "Failed to register account"));
  }
  return response.json();
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, new_password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(extractErrorMessage(error, "Failed to reset password"));
  }
  return response.json();
}

export async function getSessions(): Promise<UserSession[]> {
  const response = await fetchApi(`${API_URL}/auth/sessions`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch sessions");
  return response.json();
}

export async function revokeSession(id: string): Promise<void> {
  const response = await fetchApi(`${API_URL}/auth/sessions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to revoke session");
}
