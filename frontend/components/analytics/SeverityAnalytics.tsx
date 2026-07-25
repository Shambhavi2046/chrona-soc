"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";

interface SeverityAnalyticsProps {
  data: Array<{ severity: string; count: number }>;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#EF4444",
  High: "#F59E0B",
  Medium: "#3B82F6",
  Low: "#6B7280"
};

export default function SeverityAnalytics({ data }: SeverityAnalyticsProps) {
  return (
    <div className="glass-card rounded-xl p-6 h-[400px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Threat Severity Distribution</h3>
        <p className="text-sm text-gray-400">Categorization of active threats</p>
      </div>
      
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" horizontal={false} />
            <XAxis type="number" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis dataKey="severity" type="category" stroke="#E2E8F0" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: '#2D3748', opacity: 0.4}}
              contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity] || "#6B7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
