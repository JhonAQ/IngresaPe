'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ReturnToUserFabProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  targetRef: React.RefObject<HTMLElement | null>;
}

export const ReturnToUserFab: React.FC<ReturnToUserFabProps> = ({
  scrollContainerRef,
  targetRef,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');

  // Reiniciar estado cuando cambia el target (ej: cambio de tab en ranking).
  useEffect(() => {
    setIsVisible(false);
    setDirection('down');
  }, [targetRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const updateVisibility = () => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const isAbove = targetRect.bottom < containerRect.top;
      const isBelow = targetRect.top > containerRect.bottom;
      const isOutside = isAbove || isBelow;

      setIsVisible(isOutside);
      if (isOutside) {
        setDirection(isAbove ? 'up' : 'down');
      }
    };

    // Chequeo inicial.
    updateVisibility();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const containerRect = container.getBoundingClientRect();
        const targetRect = entry.boundingClientRect;
        const isAbove = targetRect.bottom < containerRect.top;
        const isBelow = targetRect.top > containerRect.bottom;
        const isOutside = isAbove || isBelow;

        setIsVisible(isOutside);
        if (isOutside) {
          setDirection(isAbove ? 'up' : 'down');
        }
      },
      { root: container, threshold: 0, rootMargin: '40px 0px 40px 0px' }
    );

    observer.observe(target);

    // También recalcular mientras se hace scroll (animaciones suaves, etc.).
    container.addEventListener('scroll', updateVisibility, { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', updateVisibility);
    };
  }, [scrollContainerRef, targetRef]);

  const scrollToUser = () => {
    const container = scrollContainerRef.current;
    const target = targetRef.current;
    if (!container || !target) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top - containerRect.top + container.scrollTop;
    const visibleCenter = container.clientHeight / 2;

    let scrollTop = targetTop - visibleCenter + targetRect.height / 2;
    const maxScroll = container.scrollHeight - container.clientHeight;
    if (scrollTop < 0) scrollTop = 0;
    if (maxScroll > 0 && scrollTop > maxScroll) scrollTop = maxScroll;

    container.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <motion.button
      onClick={scrollToUser}
      initial={{ x: '-50%', scale: 0, opacity: 0 }}
      animate={{ x: '-50%', scale: [1, 1.08, 1], opacity: 1 }}
      transition={{
        opacity: { duration: 0.2 },
        x: { duration: 0 },
        scale: { repeat: Infinity, duration: 1.4, ease: 'easeInOut' },
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9, y: 3 }}
      className="fixed bottom-24 left-1/2 z-50 w-12 h-12 rounded-full bg-white text-[#1cb0f6] shadow-[0_6px_0_#e5e7eb] border-2 border-slate-100 flex items-center justify-center"
      aria-label="Volver a mi posición"
    >
      {direction === 'up' ? (
        <ChevronUp size={28} strokeWidth={3} />
      ) : (
        <ChevronDown size={28} strokeWidth={3} />
      )}
    </motion.button>
  );
};
