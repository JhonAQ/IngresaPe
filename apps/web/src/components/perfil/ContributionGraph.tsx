import { Activity } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  intensity: number;
  questionsAnswered?: number;
  nodesCompleted?: number;
  simulacrosCompleted?: number;
  xpEarned?: number;
  gemsEarned?: number;
}

interface ContributionGraphProps {
  /** Semanas a mostrar. Por defecto 18. */
  weeks?: number;
  /** Datos de actividad del backend. Si no se proporciona o está vacío, se genera demo. */
  data?: HeatmapDay[];
}

const DAY_MS = 86_400_000;
const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const INTENSITY_COLORS = [
  '#f1f5f9', // 0
  '#d7ffb8', // 1
  '#a1e459', // 2
  '#58cc02', // 3
  '#46a302', // 4
];

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function getMonday(date: Date): Date {
  const day = date.getDay(); // 0 = domingo, 1 = lunes
  const delta = day === 0 ? -6 : 1 - day;
  return addDays(date, delta);
}

function formatISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthLabel(month: number): string {
  return ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'][month];
}

function generateDemoData(weeks: number): HeatmapDay[] {
  const today = startOfDay(new Date());
  const totalCells = weeks * 7;
  const start = getMonday(addDays(today, -(weeks - 1) * 7));
  const values: HeatmapDay[] = [];

  for (let i = 0; i < totalCells; i++) {
    const date = formatISODate(addDays(start, i));
    const isRecent = i > totalCells - 40;
    const intensity = Math.random() > (isRecent ? 0.35 : 0.8)
      ? Math.floor(Math.random() * 4) + 1
      : 0;
    values.push({ date, intensity });
  }

  return values;
}

function buildHeatmap(data: HeatmapDay[], weeks: number): HeatmapDay[] {
  const today = startOfDay(new Date());
  const totalCells = weeks * 7;
  const start = getMonday(addDays(today, -(weeks - 1) * 7));

  const lookup = new Map(data.map((d) => [d.date, d]));
  const values: HeatmapDay[] = [];

  for (let i = 0; i < totalCells; i++) {
    const date = addDays(start, i);
    const key = formatISODate(date);
    const log = lookup.get(key);
    values.push({
      date: key,
      intensity: log?.intensity ?? 0,
      questionsAnswered: log?.questionsAnswered,
      nodesCompleted: log?.nodesCompleted,
      simulacrosCompleted: log?.simulacrosCompleted,
      xpEarned: log?.xpEarned,
      gemsEarned: log?.gemsEarned,
    });
  }

  return values;
}

function tooltipText(day: HeatmapDay): string {
  const parts = [`${day.date}`];
  if (day.questionsAnswered) parts.push(`${day.questionsAnswered} preguntas`);
  if (day.nodesCompleted) parts.push(`${day.nodesCompleted} nodos`);
  if (day.simulacrosCompleted) parts.push(`${day.simulacrosCompleted} simulacro${day.simulacrosCompleted > 1 ? 's' : ''}`);
  if (day.xpEarned) parts.push(`${day.xpEarned} XP`);
  if (day.gemsEarned) parts.push(`${day.gemsEarned} gemas`);
  if (parts.length === 1) parts.push('Sin actividad');
  return parts.join(' · ');
}

export function ContributionGraph({ weeks = 18, data }: ContributionGraphProps) {
  const [hovered, setHovered] = useState<{ index: number; day: HeatmapDay } | null>(null);

  const values = useMemo(() => {
    if (!data || data.length === 0) return generateDemoData(weeks);
    return buildHeatmap(data, weeks);
  }, [data, weeks]);

  const monthLabels = useMemo(() => {
    const labels: { index: number; label: string }[] = [];
    const seenMonths = new Set<number>();
    for (let i = 0; i < values.length; i++) {
      const date = new Date(`${values[i].date}T00:00:00`);
      const month = date.getMonth();
      if (!seenMonths.has(month)) {
        const weekIdx = Math.floor(i / 7);
        labels.push({ index: weekIdx, label: monthLabel(month) });
        seenMonths.add(month);
      }
    }
    return labels;
  }, [values]);

  return (
    <div className="w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
          <Activity size={18} className="text-[#58cc02]" strokeWidth={3} /> Actividad
        </h3>
        <span className="font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest">
          Últimos meses
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-1">
        <div className="grid grid-rows-7 gap-[4px] text-[9px] font-bold text-slate-400 items-center justify-items-end pr-1 mt-[18px]">
          {DAYS.map((label, i) => (
            <div key={`label-${i}`} className="h-3 leading-[12px]">
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="relative h-4 mb-1">
            {monthLabels.map(({ index, label }) => (
              <span
                key={`month-${index}`}
                className="absolute top-0 text-[10px] font-black text-slate-300 uppercase tracking-widest"
                style={{ left: `calc(${(index / weeks) * 100}% + 2px)` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[4px]">
            {Array.from({ length: weeks }).map((_, weekIdx) => (
              <div
                key={`week-${weekIdx}`}
                className="grid grid-rows-7 gap-[4px] opacity-0 animate-[fade-in_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${weekIdx * 30}ms` }}
              >
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const index = weekIdx * 7 + dayIdx;
                  const day = values[index];
                  const val = day?.intensity ?? 0;
                  const color = INTENSITY_COLORS[val] ?? INTENSITY_COLORS[0];
                  return (
                    <div
                      key={`day-${weekIdx}-${dayIdx}`}
                      data-testid="heatmap-day"
                      data-intensity={val}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] shadow-sm transition-transform duration-150 hover:scale-110 hover:ring-2 hover:ring-slate-300 cursor-pointer"
                      title={day ? tooltipText(day) : ''}
                      style={{
                        backgroundColor: color,
                        boxShadow: val > 0 ? `0 0 8px ${color}40` : 'none',
                      }}
                      onMouseEnter={() => day && setHovered({ index, day })}
                      onMouseLeave={() => setHovered(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {hovered && (
        <div className="mt-3 text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 truncate">
          {tooltipText(hovered.day)}
        </div>
      )}
    </div>
  );
}
