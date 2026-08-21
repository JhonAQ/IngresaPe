'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { ALERTS } from '../news/data';

export function NotificationBell({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const unreadCount = ALERTS.filter(a => a.level === 'urgent').length;

  const btnClass = theme === 'dark' 
    ? 'bg-white/10 text-white hover:bg-white/20 border-white/10 backdrop-blur-md' 
    : 'bg-slate-100 text-[#15192B] hover:bg-slate-200 border-transparent';

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-9 h-9 rounded-[1rem] flex items-center justify-center transition-colors active:scale-95 border ${btnClass}`}
      >
        <Bell size={18} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-[999]">
          <h3 className="font-black text-[13px] text-slate-800 px-2 py-1.5 border-b border-slate-100 mb-2">Notificaciones</h3>
          <div className="max-h-64 overflow-y-auto hide-scrollbar space-y-1">
            {ALERTS.map(alert => (
              <div key={alert.id} className={`p-2.5 rounded-xl ${alert.level === 'urgent' ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${alert.level === 'urgent' ? 'text-red-500' : 'text-slate-400'}`}>
                    {alert.level === 'urgent' ? 'Urgente' : 'Info'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">{alert.date}</span>
                </div>
                <h4 className="font-black text-[11px] text-slate-700 leading-tight mb-0.5">{alert.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-snug">{alert.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
