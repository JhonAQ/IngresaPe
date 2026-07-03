import React from 'react';
import { Settings, User, Crown } from 'lucide-react';

interface ProfileHeaderProps {
  name: string | null;
  image?: string | null;
  career?: { name: string } | null;
  isPremium?: boolean;
}

export function ProfileHeader({
  name,
  image,
  career,
  isPremium,
}: ProfileHeaderProps) {
  const displayName = name || 'Estudiante';
  const hasCareer = !!career?.name;

  return (
    <div className="relative bg-gradient-to-b from-success-500 to-success-600 pt-8 pb-14 px-5 rounded-b-[2.5rem] overflow-hidden">
      {/* Patrón de puntos sutil */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, white 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
        }}
      />

      {/* Settings button */}
      <button className="absolute top-5 right-5 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors active:scale-95 z-20">
        <Settings size={20} strokeWidth={2.5} />
      </button>

      <div className="flex flex-col items-center relative z-10">
        {/* Avatar */}
        <div className="relative mb-4">
          <div className="w-[100px] h-[100px] rounded-full bg-white p-1.5 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} className="text-slate-400" strokeWidth={1.5} />
              )}
            </div>
          </div>

          {/* PRO Badge */}
          {isPremium && (
            <div className="absolute -bottom-1 -left-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md flex items-center gap-0.5 border-2 border-white">
              <Crown size={10} strokeWidth={3} className="fill-white" />
              PRO
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-white font-black text-[26px] tracking-tight leading-tight text-center">
          {displayName}
        </h1>

        {/* Career tag / CTA */}
        <div className="mt-2.5">
          {hasCareer ? (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span className="text-white font-bold text-[13px]">{career?.name}</span>
            </div>
          ) : (
            <button className="flex items-center gap-1.5 bg-white text-duo-blue px-4 py-1.5 rounded-full font-black text-[13px] shadow-sm hover:bg-slate-50 transition-colors">
              Elige tu carrera
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
