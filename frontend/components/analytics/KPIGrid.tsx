"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon, Activity, AlertTriangle, ShieldAlert, Crosshair, Clock, Shield, Server, FileSearch, ShieldCheck, Zap, Target } from "lucide-react";

interface KPIGridProps {
  data: {
    totalIncidents: number;
    activeIncidents: number;
    criticalIncidents: number;
    highSeverityAlerts: number;
    openInvestigations: number;
    activeThreats: number;
    highRiskAssets: number;
    securityScore: number;
    overallRiskScore: number;
    threatIntelMatches: number;
    mttd: string;
    mttr: string;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function KPIGrid({ data }: KPIGridProps) {
  const kpis = [
    { label: "Total Incidents", value: data.totalIncidents, icon: Activity, color: "text-soc-accent", link: "/alerts" },
    { label: "Active Incidents", value: data.activeIncidents, icon: AlertTriangle, color: "text-soc-warning", link: "/alerts?status=open" },
    { label: "Critical Incidents", value: data.criticalIncidents, icon: ShieldAlert, color: "text-soc-danger", link: "/alerts?severity=critical" },
    { label: "High Sev Alerts", value: data.highSeverityAlerts, icon: Zap, color: "text-soc-warning", link: "/alerts?severity=high" },
    { label: "Open Investigations", value: data.openInvestigations, icon: FileSearch, color: "text-soc-accent", link: "/investigations" },
    { label: "Active Threats", value: data.activeThreats, icon: Crosshair, color: "text-soc-danger", link: "/threat-intelligence" },
    { label: "High Risk Assets", value: data.highRiskAssets, icon: Server, color: "text-soc-danger", link: "/analytics" },
    { label: "Security Score", value: `${data.securityScore}/100`, icon: ShieldCheck, color: "text-soc-success", link: "/analytics" },
    { label: "Risk Score", value: `${data.overallRiskScore}/100`, icon: Shield, color: "text-soc-warning", link: "/analytics" },
    { label: "Intel Matches", value: data.threatIntelMatches, icon: Target, color: "text-soc-accent", link: "/threat-intelligence" },
    { label: "MTTD", value: data.mttd, icon: Clock, color: "text-gray-400", link: "/analytics" },
    { label: "MTTR", value: data.mttr, icon: Clock, color: "text-gray-400", link: "/analytics" },
  ];

  return (
    <motion.div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.div key={index} variants={itemVariants}>
            <Link href={kpi.link}>
              <div className="glass-card p-4 rounded-xl flex flex-col h-full hover:bg-soc-card-hover/50 hover:border-soc-accent/50 transition-all duration-300 group cursor-pointer shadow-lg hover:shadow-soc-accent/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors">{kpi.label}</span>
                  <Icon className={`w-4 h-4 ${kpi.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
                </div>
                <div className="mt-auto">
                  <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}


