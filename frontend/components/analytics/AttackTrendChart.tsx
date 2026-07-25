"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface AttackTrendChartProps {
  data: Array<{ timestamp: string; count: number }>;
}

export default function AttackTrendChart({ data }: AttackTrendChartProps) {
  return (
    <div className="glass-card rounded-xl p-6 h-[400px] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Attack Trends</h3>
          <p className="text-sm text-gray-400">Total detected incidents over time</p>
        </div>
        <div className="flex gap-2">
          {["Hour", "Day", "Week", "Month"].map((tf) => (
            <button key={tf} className="px-3 py-1 text-xs font-medium bg-soc-bg border border-soc-border hover:border-soc-accent text-gray-400 hover:text-white rounded transition-colors">
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
            <XAxis dataKey="timestamp" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1A202C', borderColor: '#2D3748', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#60A5FA' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3B82F6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
