import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'gold' | 'secondary' | 'locked' | 'neon';

interface Button3DProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  children: React.ReactNode;
  variant?: ButtonVariant;
}

export const Button3D: React.FC<Button3DProps> = ({ 
  children, 
  variant = 'primary', 
  disabled, 
  onClick, 
  className = '',
  ...props
}) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-blue-600 text-white shadow-[0_5px_0_0_#1d4ed8] hover:bg-blue-500",
    gold: "bg-yellow-400 text-yellow-950 shadow-[0_5px_0_0_#ca8a04] hover:bg-yellow-300",
    secondary: "bg-slate-100 text-slate-600 shadow-[0_5px_0_0_#cbd5e1] hover:bg-slate-200 border-2 border-slate-200",
    locked: "bg-slate-100 text-slate-400 shadow-[0_5px_0_0_#e2e8f0] cursor-not-allowed",
    neon: "bg-cyan-400 text-slate-900 shadow-[0_5px_0_0_#0891b2] hover:bg-cyan-300 border-t border-white/40"
  };

  return (
    <motion.button 
      whileTap={!disabled ? { y: 4, boxShadow: 'none' } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative w-full font-black rounded-2xl transition-colors flex items-center justify-center gap-2 py-3 uppercase tracking-widest text-[13px] ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
