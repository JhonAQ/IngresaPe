import { Activity } from 'lucide-react';

interface ContributionGraphProps {
  /** Semanas a mostrar. Por defecto 18. */
  weeks?: number;
  /**
   * Datos de actividad como array plano de valores 0-4.
   * Longitud esperada: weeks * 7. Si no se proporciona, se genera demo.
   */
  data?: number[];
}

const DAYS = ['Lun', '', 'Mié', '', 'Vie', '', ''];

const INTENSITY_COLORS = [
  '#f1f5f9', // 0
  '#d7ffb8', // 1
  '#a1e459', // 2
  '#58cc02', // 3
  '#46a302', // 4
];

function generateDemoData(weeks: number): number[] {
  const total = weeks * 7;
  return Array.from({ length: total }, (_, i) => {
    const isRecent = i > total - 40;
    return Math.random() > (isRecent ? 0.3 : 0.75)
      ? Math.floor(Math.random() * 4) + 1
      : 0;
  });
}

export function ContributionGraph({ weeks = 18, data }: ContributionGraphProps) {
  const values = data && data.length > 0 ? data : generateDemoData(weeks);
  const padded = values.slice(0, weeks * 7);

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

      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        <div className="grid grid-rows-7 gap-[4px] text-[9px] font-bold text-slate-400 items-center justify-items-end pr-1 mt-[18px]">
          {DAYS.map((label, i) => (
            <div key={`label-${i}`} className="h-3 leading-[12px]">
              {label}
            </div>
          ))}
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex justify-between w-[95%] mb-1.5 text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">
            <span>Mar</span>
            <span>Abr</span>
            <span>May</span>
            <span>Jun</span>
          </div>

          <div className="flex gap-[4px]">
            {Array.from({ length: weeks }).map((_, weekIdx) => (
              <div
                key={`week-${weekIdx}`}
                className="grid grid-rows-7 gap-[4px] opacity-0 animate-[fade-in_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${weekIdx * 30}ms` }}
              >
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const val = padded[weekIdx * 7 + dayIdx] ?? 0;
                  const color = INTENSITY_COLORS[val] ?? INTENSITY_COLORS[0];
                  return (
                    <div
                      key={`day-${weekIdx}-${dayIdx}`}
                      className="w-3.5 h-3.5 rounded-[4px] shadow-sm"
                      style={{
                        backgroundColor: color,
                        boxShadow: val > 0 ? `0 0 8px ${color}40` : 'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
