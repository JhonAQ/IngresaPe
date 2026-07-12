'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Info, Clock } from 'lucide-react';
import { ALERTS, type AdmisionAlert } from './data';

function AlertCard({ alert, index }: { alert: AdmisionAlert; index: number }) {
  const isUrgent = alert.level === 'urgent';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUrgent ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative overflow-hidden rounded-[1.25rem] border-2 p-4 ${
        isUrgent
          ? 'bg-[#C41E3A]/5 border-[#C41E3A]/20'
          : 'bg-white border-slate-100'
      }`}
    >
      {isUrgent && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#C41E3A]/10 rounded-bl-full pointer-events-none" />
      )}

      <div className="relative z-10 flex items-start gap-3">
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isUrgent ? 'bg-[#C41E3A] text-white' : 'bg-slate-100 text-[#8B8F98]'
          }`}
        >
          {isUrgent ? (
            <AlertTriangle size={20} strokeWidth={2.5} />
          ) : (
            <Info size={20} strokeWidth={2.5} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isUrgent
                  ? 'bg-[#C41E3A] text-white'
                  : 'bg-slate-100 text-[#8B8F98]'
              }`}
            >
              {isUrgent ? 'Urgente' : 'Informativo'}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#8B8F98]">
              <Clock size={10} />
              {alert.date}
            </span>
          </div>
          <h3 className="font-black text-[14px] text-[#15192B] leading-snug">
            {alert.title}
          </h3>
          <p className="text-[12px] font-bold text-[#8B8F98] mt-1 leading-relaxed">
            {alert.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function AlertFeed() {
  const urgent = ALERTS.filter((a) => a.level === 'urgent');
  const info = ALERTS.filter((a) => a.level === 'info');

  return (
    <section className="px-5 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-black text-[16px] text-[#15192B]">
          Alertas de admisión
        </h2>
        {urgent.length > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-[#C41E3A] text-white text-[10px] font-black">
            {urgent.length} urgente{urgent.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {urgent.map((alert, idx) => (
          <AlertCard key={alert.id} alert={alert} index={idx} />
        ))}
        {info.slice(0, 3).map((alert, idx) => (
          <AlertCard key={alert.id} alert={alert} index={idx} />
        ))}
      </div>
    </section>
  );
}
