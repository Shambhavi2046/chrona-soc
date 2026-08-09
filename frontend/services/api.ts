import { API_URL } from "./config";

export async function getAuthToken(): Promise<string | null> {
  // Only attempt to read cookies automatically in the browser
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )access_token=([^;]+)"));
    return match ? match[2] : null;
  }
  // Server components must explicitly retrieve the token using next/headers
  // and pass it to the service functions to avoid boundary violations
  return null;
}

export async function fetchApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login?clear=1";
    } else {
      const { redirect } = await import("next/navigation");
      redirect("/login?clear=1");
    }
  }

  return res;
}
