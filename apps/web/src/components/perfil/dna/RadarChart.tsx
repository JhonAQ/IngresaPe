'use client';

import React, { useMemo, useState } from 'react';

export interface RadarAxis {
  id: string;
  label: string;
  accuracy: number;
  hasData: boolean;
}

interface RadarChartProps {
  axes: RadarAxis[];
  selectedAxisId?: string | null;
  onSelectAxis: (id: string) => void;
  size?: number;
  color?: string;
}

export function RadarChart({
  axes,
  selectedAxisId,
  onSelectAxis,
  size = 300,
  color = '#ce82ff',
}: RadarChartProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const padding = 48;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - padding;
  const n = axes.length;

  const getPoint = (radius: number, index: number) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      angle,
    };
  };

  const ringScales = [0.25, 0.5, 0.75, 1];

  const dataPoints = useMemo(
    () =>
      axes.map((axis, i) => ({
        ...getPoint((axis.accuracy / 100) * maxR, i),
        axis,
        index: i,
      })),
    [axes, maxR, n]
  );

  const labelPoints = useMemo(
    () =>
      axes.map((axis, i) => {
        const pos = getPoint(maxR + 22, i);
        return { ...pos, axis, index: i };
      }),
    [axes, maxR, n]
  );

  const handleSelect = (id: string) => {
    onSelectAxis(id);
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible mx-auto"
    >
      {ringScales.map((scale, i) => {
        const points = axes
          .map((_, idx) => {
            const { x, y } = getPoint(maxR * scale, idx);
            return `${x},${y}`;
          })
          .join(' ');
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={1.5}
            opacity={0.7}
          />
        );
      })}

      {axes.map((_, i) => {
        const { x, y } = getPoint(maxR, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={1.5}
          />
        );
      })}

      <polygon
        points={dataPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        fill={`${color}33`}
        stroke={color}
        strokeWidth={3}
        strokeLinejoin="round"
        className="transition-all duration-500"
      />

      {dataPoints.map((p) => {
        const isSelected = p.axis.id === selectedAxisId;
        const isHovered = p.axis.id === hoveredId;
        const fill = p.axis.hasData ? color : '#94a3b8';

        return (
          <g key={p.axis.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected ? 7 : isHovered ? 6 : 5}
              fill={fill}
              stroke="white"
              strokeWidth={2.5}
              className="transition-all duration-200"
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={18}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredId(p.axis.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(p.axis.id)}
            />
          </g>
        );
      })}

      {labelPoints.map((p) => {
        const isSelected = p.axis.id === selectedAxisId;

        return (
          <g key={p.axis.id}>
            <text
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-extrabold transition-all duration-200 cursor-pointer ${
                isSelected ? 'fill-duo-purple text-[13px]' : 'fill-slate-600 text-[11px]'
              }`}
              onMouseEnter={() => setHoveredId(p.axis.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(p.axis.id)}
            >
              {p.axis.label}
            </text>
            <text
              x={p.x}
              y={p.y + (isSelected ? 18 : 14)}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`font-black text-[9px] cursor-pointer ${
                p.axis.hasData ? 'fill-slate-400' : 'fill-slate-300'
              }`}
              onMouseEnter={() => setHoveredId(p.axis.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(p.axis.id)}
            >
              {p.axis.hasData ? `${Math.round(p.axis.accuracy)}%` : '—'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
