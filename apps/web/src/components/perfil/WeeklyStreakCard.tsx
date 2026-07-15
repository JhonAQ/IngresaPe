import { Flame } from 'lucide-react';
import { trpc } from '../../utils/trpc';
import { DayDoneIcon, DayFreezedIcon, DayNotYetIcon } from '@ingresa-pe/ui';

type StreakStatus = 'done' | 'freezed' | 'not_yet';

interface StreakDay {
  date: string;
  label: string;
  isToday: boolean;
  status: StreakStatus;
}

function DayIcon({ status }: { status: StreakStatus }) {
  if (status === 'done')
    return <DayDoneIcon className="w-9 h-9 sm:w-10 sm:h-10" />;
  if (status === 'freezed')
    return <DayFreezedIcon className="w-9 h-9 sm:w-10 sm:h-10" />;
  return <DayNotYetIcon className="w-9 h-9 sm:w-10 sm:h-10" />;
}

export function WeeklyStreakCard() {
  const { data, isLoading } = trpc.profile.getWeeklyStreak.useQuery(undefined, {
    retry: false,
  });

  return (
    <div className="w-full bg-white border-2 border-slate-200 border-b-[4px] rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-slate-800 text-[15px] flex items-center gap-2">
          <Flame size={18} className="text-[#FF9600]" strokeWidth={3} /> Racha
          semanal
        </h3>
      </div>

      {isLoading || !data ? (
        <div className="flex justify-between gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="w-5 h-3 rounded bg-slate-100 animate-pulse" />
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-between gap-1">
          {data.map((day: StreakDay) => (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-wider ${
                  day.status === 'not_yet' ? 'text-slate-300' : 'text-[#FF9600]'
                }`}
              >
                {day.label}
              </span>
              <DayIcon status={day.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
