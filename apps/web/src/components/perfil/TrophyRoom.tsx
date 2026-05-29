import React from 'react';
import { Flame, Moon, Crosshair, Award, ChevronRight } from 'lucide-react';

interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  color: string;
  bgColor: string;
}

const trophies: Trophy[] = [
  {
    id: '1',
    name: 'Primer Fuego',
    description: 'Alcanza 7 días de racha.',
    icon: <Flame size={28} strokeWidth={2} />,
    unlocked: true,
    color: '#ff9600',
    bgColor: '#fff2e0',
  },
  {
    id: '2',
    name: 'Ave Nocturna',
    description: 'Practica después de medianoche.',
    icon: <Moon size={28} strokeWidth={2} />,
    unlocked: true,
    color: '#ce82ff',
    bgColor: '#f8eaff',
  },
  {
    id: '3',
    name: 'Francotirador',
    description: '100% en un Quiz de 20 preg.',
    icon: <Crosshair size={28} strokeWidth={2} />,
    unlocked: false,
    color: '#afafaf',
    bgColor: '#f0f0f0',
  },
  {
    id: '4',
    name: 'Leyenda UNSA',
    description: 'Top 10 en un Simulacro.',
    icon: <Award size={28} strokeWidth={2} />,
    unlocked: false,
    color: '#afafaf',
    bgColor: '#f0f0f0',
  },
];

export function TrophyRoom() {
  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <h3 className="font-black text-[18px] text-slate-800">Sala de Trofeos</h3>
        <div className="bg-amber-100 px-3 py-1 rounded-full">
          <span className="text-amber-700 font-black text-[12px]">{unlockedCount} / {trophies.length + 11}</span>
        </div>
      </div>

      {/* Trophy Grid */}
      <div className="grid grid-cols-2 gap-3 px-5 pb-4">
        {trophies.map((trophy) => (
          <div
            key={trophy.id}
            className={`rounded-2xl border-2 p-4 flex flex-col items-center text-center gap-2 transition-all ${
              trophy.unlocked
                ? 'border-slate-200 border-b-[4px] border-b-slate-300 bg-white'
                : 'border-slate-100 bg-slate-50/50 opacity-60'
            }`}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: trophy.bgColor, color: trophy.color }}
            >
              {trophy.icon}
            </div>
            <span className="font-black text-[13px] text-slate-800 leading-tight">{trophy.name}</span>
            <span className="text-[10px] font-bold text-slate-400 leading-tight">{trophy.description}</span>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="px-5 pb-5">
        <button className="w-full py-3 rounded-2xl border-2 border-slate-200 border-b-[4px] border-b-slate-300 text-duo-blue font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-1 active:translate-y-[3px] active:border-b-[2px] transition-all hover:bg-slate-50">
          VER TODOS LOS LOGROS
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
