"use client";

import { usePathname } from "next/navigation";

export default function LayoutWrapper({
  children,
  sidebar,
  header,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = ["/login", "/register", "/forgot-password", "/reset-password"].includes(pathname);

  if (isAuthRoute) {
    return <main className="flex-1 h-screen overflow-hidden">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-soc-bg text-gray-100">
      {sidebar}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {header}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
