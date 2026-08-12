"use client";

import { useState } from "react";
import { Bell, User, Activity, LogOut } from "lucide-react";
import HeaderSearch from "./HeaderSearch";
import { useRouter } from "next/navigation";
import { API_URL } from "@/services/config";

export default function Header({ user }: { user?: any }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST" });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    document.cookie = "access_token=; path=/; max-age=0; samesite=strict";
    router.push("/login");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="h-16 glass sticky top-0 z-50 flex items-center justify-between px-6 border-b border-soc-border">
      {/* Search Bar */}
      <div className="flex-1 flex items-center">
        <HeaderSearch />
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-6">
        {/* System Status */}
        <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-soc-success/10 border border-soc-success/20">
          <Activity className="w-3.5 h-3.5 text-soc-success mr-2 animate-pulse" />
          <span className="text-xs font-medium text-soc-success">AI Engine Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1 text-soc-text-secondary hover:text-soc-text-primary transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-soc-danger ring-2 ring-soc-bg" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-soc-text-primary">{user?.name || "Guest"}</div>
              <div className="text-xs text-soc-text-secondary">{user?.email || "Not signed in"}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-soc-accent to-blue-600 flex items-center justify-center text-soc-text-primary text-sm font-medium ring-2 ring-soc-bg">
              {user?.name ? getInitials(user.name) : <User className="w-4 h-4" />}
            </div>
          </button>

          {showDropdown && user && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-soc-border glass bg-soc-bg shadow-xl py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-soc-border/50 flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
