'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProfileIcon, HomeIcon, SimulacroIcon } from '@ingresa-pe/ui';
import { Gamepad2, Trophy } from 'lucide-react';

const tabs = [
  {
    href: '/dashboard',
    label: 'Inicio',
    icon: HomeIcon,
    iconProps: { className: 'w-[28px] h-[24px]' },
  },
  {
    href: '/simulacros',
    label: 'Simulacro',
    icon: SimulacroIcon,
    iconProps: { className: 'w-[22px] h-[26px]' },
  },
  { href: '/ranking', label: 'Ranking', iconLucide: Trophy, size: 26 },
  { href: '/entrenar', label: 'Entrenar', iconLucide: Gamepad2, size: 26 },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: ProfileIcon,
    iconProps: { className: 'w-6 h-[24px]' },
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-t-2 border-slate-200 pb-safe z-50 flex justify-between items-center h-[72px] px-2 shrink-0">
      {tabs.map((tab) => {
        const isActive = pathname?.startsWith(tab.href);
        const colorClass = isActive ? 'text-error-500' : 'text-slate-400';
        const fontClass = isActive ? 'font-black' : 'font-bold';

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${colorClass}`}
          >
            {tab.icon ? (
              <tab.icon {...(tab.iconProps || {})} />
            ) : tab.iconLucide ? (
              <tab.iconLucide size={tab.size || 26} strokeWidth={2.5} />
            ) : null}
            <span className={`text-[10px] uppercase ${fontClass}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
