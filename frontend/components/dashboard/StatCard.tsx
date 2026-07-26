import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  colorClass?: string;
  href?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  colorClass = "text-soc-accent",
  href,
}: StatCardProps) {
  const content = (
    <div className={`glass-card rounded-xl p-6 transition-all duration-300 ${href ? "hover:-translate-y-1 hover:shadow-lg cursor-pointer" : ""} group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg bg-soc-bg border border-soc-border ${colorClass} bg-opacity-50`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && trendValue && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={`font-medium ${
              trend === "up" ? "text-soc-danger" : trend === "down" ? "text-soc-success" : "text-gray-400"
            }`}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"} {trendValue}
          </span>
          <span className="text-gray-500 ml-2">vs last 24h</span>
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : content;
}
