'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface RatingGraphProps {
  data: { weekIndex: number; score: number }[];
}

export function RatingGraph({ data }: RatingGraphProps) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 font-bold text-[12px]">
        Aún no hay datos de rating.
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="weekIndex" hide />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value) => [
              typeof value === 'number'
                ? value.toFixed(1)
                : String(value ?? ''),
              'Score',
            ]}
            labelFormatter={() => ''}
            contentStyle={{
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
          <ReferenceLine y={20} stroke="#9CA3AF" strokeDasharray="3 3" />
          <ReferenceLine y={40} stroke="#84CC16" strokeDasharray="3 3" />
          <ReferenceLine y={60} stroke="#3B82F6" strokeDasharray="3 3" />
          <ReferenceLine y={80} stroke="#F97316" strokeDasharray="3 3" />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
