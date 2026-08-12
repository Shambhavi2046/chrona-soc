"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

interface AttackTrendChartProps {
  data: Array<{ timestamp: string; count: number }>;
  currentPeriod: string;
}

export default function AttackTrendChart({ data, currentPeriod }: AttackTrendChartProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePeriodChange = (tf: string) => {
    startTransition(() => {
      router.push(`/analytics?period=${tf.toLowerCase()}`);
    });
  };

  return (
    <div className={`glass-card rounded-xl p-6 h-[400px] flex flex-col ${isPending ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-soc-text-primary">Attack Trends</h3>
          <p className="text-sm text-soc-text-secondary">Total detected incidents over time</p>
        </div>
        <div className="flex gap-2">
          {["Hour", "Day", "Week", "Month"].map((tf) => {
            const isActive = currentPeriod === tf.toLowerCase();
            return (
              <button 
                key={tf} 
                onClick={() => handlePeriodChange(tf)}
                className={`px-3 py-1 text-xs font-medium border rounded transition-colors ${
                  isActive 
                    ? "bg-soc-accent/20 border-soc-accent text-soc-accent" 
                    : "bg-soc-bg border-soc-border hover:border-soc-accent text-gray-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="flex-1 w-full h-full">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-soc-text-secondary">
            <span className="text-sm">No detected incidents in this period</span>
          </div>
        ) : (
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
                dot={{ stroke: '#3B82F6', strokeWidth: 2, r: 4, fill: '#1A202C' }}
                activeDot={{ stroke: '#60A5FA', strokeWidth: 2, r: 6, fill: '#1A202C' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
