import { TrendingUp } from 'lucide-react';
import { RANKS, getRankInfo } from '../../lib/rankMeta';

interface RatingChartProps {
  history: number[];
  dates: string[];
  currentMax?: number;
}

export function RatingChart({ history, dates, currentMax }: RatingChartProps) {
  if (history.length < 2) {
    return (
      <div className="w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
            <TrendingUp size={18} className="text-[#1cb0f6]" strokeWidth={3} /> Desempeño
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

  const width = 320;
  const height = 160;
  const paddingLeft = 25;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 20;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  const bottomY = paddingTop + graphHeight;

  const getPoint = (val: number, idx: number) => ({
    x: paddingLeft + idx * (graphWidth / (history.length - 1)),
    y: bottomY - (val / 100) * graphHeight,
    val,
  });

  const points = history.map((val, idx) => getPoint(val, idx));
  const pathD = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const areaPathD = `${pathD} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`;
  const flatPoints = points.map((p) => ({ ...p, y: bottomY }));
  const flatPathD = `M ${flatPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  const flatAreaPathD = `${flatPathD} L ${flatPoints[flatPoints.length - 1].x},${bottomY} L ${flatPoints[0].x},${bottomY} Z`;

  const yLabels = [0, 20, 40, 60, 80, 100];

  return (
    <div className="w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
          <TrendingUp size={18} className="text-[#1cb0f6]" strokeWidth={3} /> Desempeño
        </h3>
        <span className="font-bold bg-blue-50 text-blue-500 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
          Ranked Solo
        </span>
      </div>

      <div className="relative w-full overflow-visible">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#1cb0f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#1cb0f6" stopOpacity="0" />
            </linearGradient>

            {RANKS.map((r) => (
              <linearGradient key={`grad-${r.id}`} id={`grad-${r.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={r.bg} stopOpacity="0.7" />
                <stop offset="100%" stopColor={r.bg} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>

          {/* Franjas de ligas (de arriba hacia abajo: Cachimbo → Huevito) */}
          {[...RANKS].reverse().map((rank, i) => {
            const bandHeight = graphHeight / 5;
            const y = paddingTop + i * bandHeight;
            return (
              <rect
                key={rank.id}
                x={paddingLeft}
                y={y}
                width={graphWidth}
                height={bandHeight}
                fill={`url(#grad-${rank.id})`}
              />
            );
          })}

          {/* Ejes Y y líneas guía */}
          {yLabels.map((val) => {
            const y = bottomY - (val / 100) * graphHeight;
            return (
              <g key={`y-${val}`}>
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="end"
                >
                  {val}
                </text>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={val === 0 || val === 100 ? '0' : '4 4'}
                  opacity="0.8"
                />
              </g>
            );
          })}

          {/* Eje X (fechas) */}
          {dates.map((date, i) => {
            const x =
              paddingLeft + i * (graphWidth / (dates.length - 1 || 1));
            return (
              <text
                key={`x-${i}`}
                x={x}
                y={height - 2}
                fill="#94a3b8"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
              >
                {date}
              </text>
            );
          })}

          {/* Área bajo la línea */}
          <path fill="url(#chartGradient)">
            <animate
              attributeName="d"
              from={flatAreaPathD}
              to={areaPathD}
              dur="1s"
              fill="freeze"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.25 1 0.5 1"
            />
            <animate attributeName="opacity" from="0" to="1" dur="0.8s" fill="freeze" />
          </path>

          {/* Línea principal */}
          <path
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)]"
          >
            <animate
              attributeName="d"
              from={flatPathD}
              to={pathD}
              dur="1s"
              fill="freeze"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.25 1 0.5 1"
            />
          </path>

          {/* Puntos con pop-bounce escalonado */}
          {points.map((p, idx) => {
            const rankInfo = getRankInfo(p.val);
            const isMax = currentMax !== undefined && p.val === currentMax;
            return (
              <g
                key={`p-${idx}`}
                className="opacity-0 animate-[pop-bounce_0.6s_ease-out_forwards]"
                style={{
                  animationDelay: `${700 + idx * 80}ms`,
                  transformOrigin: `${p.x}px ${p.y}px`,
                }}
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
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
