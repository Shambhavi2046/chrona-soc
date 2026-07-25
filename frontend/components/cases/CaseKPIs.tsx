"use client";

import { motion } from "framer-motion";
import StatCard from "@/components/dashboard/StatCard";
import { Briefcase, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface CaseKPIsProps {
  cases: any[];
}

export default function CaseKPIs({ cases }: CaseKPIsProps) {
  const activeCases = cases.filter(c => !["Resolved", "Closed"].includes(c.status)).length;
  const criticalCases = cases.filter(c => c.priority === "High" && !["Resolved", "Closed"].includes(c.status)).length;
  const unassignedCases = cases.filter(c => !c.assignee && !["Resolved", "Closed"].includes(c.status)).length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Active Cases"
        value={activeCases}
        icon={Briefcase}
        colorClass="text-soc-accent border-soc-accent"
      />
      <StatCard
        title="Critical Priority"
        value={criticalCases}
        icon={AlertTriangle}
        colorClass="text-soc-danger border-soc-danger glow-danger"
      />
      <StatCard
        title="Unassigned"
        value={unassignedCases}
        icon={Clock}
        colorClass="text-soc-warning border-soc-warning"
      />
      <StatCard
        title="SLA Compliance"
        value="94%"
        icon={CheckCircle}
        trend="up"
        trendValue="+2%"
        colorClass="text-soc-success border-soc-success"
      />
    </div>
  );
}
