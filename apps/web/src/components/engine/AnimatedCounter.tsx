'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  formatTime?: boolean;
  className?: string;
}

export function AnimatedCounter({
  targetValue,
  duration = 1.5,
  prefix = '',
  suffix = '',
  formatTime = false,
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min(
        (timestamp - startTimestamp) / (duration * 1000),
        1
      );
      const easeOut = progress * (2 - progress);
      setCount(Math.floor(easeOut * targetValue));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
        setIsFinished(true);
      }
    };

    animationFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  let displayValue = count.toString();
  if (formatTime) {
    const m = Math.floor(count / 60);
    const s = count % 60;
    displayValue = `${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  }

  return (
    <motion.span
      animate={
        isFinished
          ? {
              scale: [1, 1.4, 0.9, 1.1, 1],
              rotate: [0, -4, 4, -2, 0],
            }
          : {}
      }
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={`inline-block origin-center ${className}`}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  );
}
