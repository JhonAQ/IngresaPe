import { ChevronLeft, Flame, Hexagon } from 'lucide-react';

interface HeaderProps {
  racha: number;
  gemas: number;
}

export function DashboardHeader({ racha, gemas }: HeaderProps) {
  return (
    <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100">
      <div className="flex items-center gap-2 text-slate-400 font-bold">
        <ChevronLeft size={24} />
        <span>Biología</span>
      </div>
      <div className="flex items-center gap-4 text-slate-700">
        <div className="flex items-center gap-1.5 text-orange-500 font-black text-lg">
          <Flame className="fill-orange-500" size={18} /> <span>{racha}</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-500 font-black text-lg">
          <Hexagon className="fill-blue-500" size={18} /> <span>{gemas}</span>
        </div>
      </div>
    </div>
  );
}
