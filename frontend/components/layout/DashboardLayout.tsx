import Sidebar from "./Sidebar";
import Header from "./Header";
import { fetchApi } from "@/services/api";
import { cookies } from "next/headers";
import LayoutWrapper from "./LayoutWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (token) {
      const res = await fetchApi("/auth/me", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        user = await res.json();
      }
    }
  } catch (e) {
    // If we fail to fetch the user, the middleware will catch unauthorized routes.
    // We swallow the error here so the layout doesn't crash on public routes or during middleware redirect.
  }

  return (
    <LayoutWrapper sidebar={<Sidebar />} header={<Header user={user} />}>
      {children}
    </LayoutWrapper>
  );
}
