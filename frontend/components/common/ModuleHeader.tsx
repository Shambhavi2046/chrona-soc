import React from "react";
import { LucideIcon } from "lucide-react";

export interface HeaderAction {
  label: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "outline";
  onClick?: () => void;
}

export interface ModuleHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: HeaderAction[];
}

export default function ModuleHeader({ title, subtitle, icon: Icon, actions = [] }: ModuleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-soc-text-primary flex items-center">
          <Icon className="w-7 h-7 text-soc-accent mr-3" />
          {title}
        </h1>
        <p className="text-soc-text-secondary mt-1">{subtitle}</p>
      </div>
      
      {actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action, index) => {
            const isPrimary = action.variant === "primary";
            const isOutline = action.variant === "outline";
            
            return (
              <button
                key={index}
                onClick={action.onClick}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPrimary
                    ? "bg-soc-accent hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    : isOutline
                    ? "bg-soc-bg border border-soc-border hover:border-soc-accent text-soc-accent hover:text-white hover:bg-soc-accent/10"
                    : "bg-soc-bg border border-soc-border hover:border-gray-500 text-gray-300 hover:text-white"
                }`}
              >
                <action.icon className="w-4 h-4 mr-2" />
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
