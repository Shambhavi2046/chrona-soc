import { API_URL } from "./config";
export interface User {
  id: string;
  name: string;
  email: string;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}
