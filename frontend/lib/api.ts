const API_URL = "http://127.0.0.1:8000/api/v1";

export async function getDashboardStats() {
  const response = await fetch(
    `${API_URL}/dashboard`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}