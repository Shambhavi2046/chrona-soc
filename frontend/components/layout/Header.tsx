"use client";

import { Bell, Search, User, Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 glass sticky top-0 z-50 flex items-center justify-between px-6 border-b border-soc-border">
      {/* Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border border-soc-border rounded-lg leading-5 bg-soc-bg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-soc-accent focus:border-soc-accent sm:text-sm transition-colors"
            placeholder="Search alerts, IPs, domains, hashes..."
          />
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-6">
        {/* System Status */}
        <div className="hidden md:flex items-center px-3 py-1 rounded-full bg-soc-success/10 border border-soc-success/20">
          <Activity className="w-3.5 h-3.5 text-soc-success mr-2 animate-pulse" />
          <span className="text-xs font-medium text-soc-success">AI Engine Active</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1 text-gray-400 hover:text-white transition-colors focus:outline-none">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-soc-danger ring-2 ring-soc-bg" />
        </button>

        {/* Profile */}
        <div className="flex items-center cursor-pointer">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-soc-accent to-blue-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-soc-bg">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
