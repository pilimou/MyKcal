'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { BodyMetric } from '@/lib/types';

interface MetricChartProps {
  data: BodyMetric[];
}

export default function MetricChart({ data }: MetricChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        尚無數據
      </div>
    );
  }

  // Format dates for X-axis
  const chartData = data.map(m => ({
    ...m,
    displayDate: m.date.split('-').slice(1).join('/'),
  }));

  return (
    <div className="w-full h-80 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="displayDate" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#e8ecf4'
            }}
            itemStyle={{ color: '#e8ecf4' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Line 
            name="體重 (kg)"
            type="monotone" 
            dataKey="weight" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            name="體脂 (%)"
            type="monotone" 
            dataKey="bodyFat" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#ef4444', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line 
            name="腰圍 (cm)"
            type="monotone" 
            dataKey="waist" 
            stroke="#fbbf24" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Line 
            name="骨骼肌量 (%)"
            type="monotone" 
            dataKey="skeletalMuscle" 
            stroke="#6366f1" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
