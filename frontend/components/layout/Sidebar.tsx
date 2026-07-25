"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShieldAlert,
  Search,
  Network,
  BarChart3,
  FileText,
  Settings,
  Shield
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Alerts", href: "/alerts", icon: ShieldAlert },
  { name: "Investigations", href: "/investigations", icon: Search },
  { name: "Threat Intelligence", href: "/threat-intelligence", icon: Network },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen border-r border-soc-border bg-soc-card hidden md:flex flex-col sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-soc-border">
        <Shield className="w-6 h-6 text-soc-accent mr-3" />
        <span className="font-bold text-lg tracking-wide text-white">Chrona SOC</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-soc-accent/10 text-soc-accent"
                  : "text-gray-400 hover:bg-soc-card-hover hover:text-gray-200"
              }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 flex-shrink-0 transition-colors ${
                  isActive ? "text-soc-accent" : "text-gray-500 group-hover:text-gray-300"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom version info */}
      <div className="p-4 border-t border-soc-border">
        <div className="text-xs text-gray-500 text-center">
          v2.4.1 (Enterprise)
        </div>
      </div>
    </aside>
  );
}
