import { useMemo, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { RANKS, getRankInfo } from '../../lib/rankMeta';

interface RatingChartProps {
  history: number[];
  dates: string[];
  currentMax?: number;
}

const WIDTH = 320;
const HEIGHT = 160;
const PADDING = { top: 10, right: 10, bottom: 24, left: 28 };

export function RatingChart({ history, dates, currentMax }: RatingChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    date: string;
    score: number;
  } | null>(null);

  const graphWidth = WIDTH - PADDING.left - PADDING.right;
  const graphHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const bottomY = PADDING.top + graphHeight;

  const points = useMemo(() => {
    if (history.length === 0) return [];
    const maxValue = 100;
    const count = history.length;
    return history.map((val, idx) => ({
      x:
        PADDING.left +
        (count === 1 ? graphWidth / 2 : idx * (graphWidth / (count - 1))),
      y: bottomY - (val / maxValue) * graphHeight,
      val,
    }));
  }, [history, graphWidth, graphHeight, bottomY]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  }, [points]);

  const yLabels = [0, 20, 40, 60, 80, 100];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (points.length === 0 || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const svgX = (e.clientX - rect.left) * scaleX;

    let nearest = points[0];
    let minDist = Math.abs(nearest.x - svgX);
    for (let i = 1; i < points.length; i++) {
      const dist = Math.abs(points[i].x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearest = points[i];
      }
    }

    if (minDist <= 40) {
      const idx = points.indexOf(nearest);
      setTooltip({
        x: e.clientX - rect.left,
        y: (nearest.y / HEIGHT) * rect.height,
        date: dates[idx] ?? '',
        score: nearest.val,
      });
    } else {
      setTooltip(null);
    }
  };

  const handleMouseLeave = () => setTooltip(null);

  if (history.length === 0) {
    return (
      <div className="w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
            <TrendingUp size={18} className="text-[#1cb0f6]" strokeWidth={3} />{' '}
            Desempeño
          </h3>
          <span className="font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
            Ranked Solo
          </span>
        </div>
        <div className="h-40 flex items-center justify-center text-slate-400 font-black text-[12px]">
          Aún no hay historial de simulacros.
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
          <TrendingUp size={18} className="text-[#1cb0f6]" strokeWidth={3} />{' '}
          Desempeño
        </h3>
        <span className="font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
          Ranked Solo
        </span>
      </div>

      <div className="relative w-full">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full h-auto overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {RANKS.map((r) => (
              <linearGradient
                key={`grad-${r.id}`}
                id={`grad-${r.id}`}
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop offset="0%" stopColor={r.bg} stopOpacity="0.7" />
                <stop offset="100%" stopColor={r.bg} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>

          {/* Franjas de ligas */}
          {[...RANKS].reverse().map((rank, i) => {
            const bandHeight = graphHeight / 5;
            const y = PADDING.top + i * bandHeight;
            return (
              <rect
                key={rank.id}
                x={PADDING.left}
                y={y}
                width={graphWidth}
                height={bandHeight}
                fill={`url(#grad-${rank.id})`}
              />
            );
          })}

          {/* Líneas guía Y */}
          {yLabels.map((val) => {
            const y = bottomY - (val / 100) * graphHeight;
            return (
              <g key={`y-${val}`}>
                <text
                  x={PADDING.left - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="end"
                >
                  {val}
                </text>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={WIDTH - PADDING.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={val === 0 || val === 100 ? '0' : '4 4'}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Eje X */}
          {dates.map((date, i) => {
            const x = points[i]?.x ?? PADDING.left;
            return (
              <text
                key={`x-${i}`}
                x={x}
                y={HEIGHT - 4}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
              >
                {date}
              </text>
            );
          })}

          {/* Línea principal */}
          {points.length > 1 && (
            <motion.path
              d={pathD}
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Puntos */}
          {points.map((p, idx) => {
            const rankInfo = getRankInfo(p.val);
            const isMax = currentMax !== undefined && p.val === currentMax;
            return (
              <motion.g
                key={`p-${idx}`}
                data-testid="rating-point"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.5 + idx * 0.08,
                  type: 'spring',
                  stiffness: 400,
                  damping: 15,
                }}
                style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              >
                {isMax && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="none"
                    stroke="#ffc800"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                    className="animate-[spin_4s_linear_infinite]"
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isMax ? 5.5 : 4.5}
                  fill={rankInfo.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="drop-shadow-md"
                />
              </motion.g>
            );
          })}
        </svg>

        {tooltip && (
          <div
            className="absolute pointer-events-none bg-slate-800 text-white text-[11px] font-black px-2 py-1 rounded-md shadow-lg -translate-x-1/2 -translate-y-full mt-[-6px]"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.date} · {tooltip.score.toFixed(1)}
          </div>
        )}
      </div>
    </div>
  );
}
