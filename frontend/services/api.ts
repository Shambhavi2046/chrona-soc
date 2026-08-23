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

interface FetchApiOptions extends RequestInit {
  _retry?: boolean;
}

export async function fetchApi(endpoint: string, options: FetchApiOptions = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let url = endpoint;
  if (typeof window === "undefined" && url.startsWith("/")) {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
    url = `${backendUrl}${url}`;
  } else if (!url.startsWith("http") && !url.startsWith("/")) {
    url = `${API_URL}/${url}`;
  }
  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !options._retry) {
      options._retry = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });
        
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data.access_token) {
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; samesite=strict`;
            const newHeaders = new Headers(options.headers || {});
            newHeaders.set("Authorization", `Bearer ${data.access_token}`);
            res = await fetch(url, { ...options, headers: newHeaders });
            return res;
          }
        }
      } catch (err) {
        // Refresh failed, proceed to redirect
      }
      window.location.href = "/login?clear=1";
    } else if (typeof window === "undefined") {
      const { redirect } = await import("next/navigation");
      redirect("/login?clear=1");
    }
  }

  return res;
}
