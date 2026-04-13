import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface ChunkyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "purple"
    | "neutral";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const VARIANTS = {
  primary:
    "bg-error-500 border-[#cc3636] text-white active:bg-error-500/90 shadow-red-500/20",
  secondary:
    "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100",
  danger: "bg-rose-500 border-rose-700 text-white active:bg-rose-600",
  success: "bg-green-500 border-green-600 text-white active:bg-green-600",
  purple: "bg-purple-500 border-purple-600 text-white active:bg-purple-600",
  neutral: "bg-slate-200 border-slate-300 text-slate-500 active:bg-slate-300",
};

const SIZES = {
  sm: "h-10 text-xs border-b-[3px] active:translate-y-[3px]",
  md: "h-12 text-sm border-b-[4px] active:translate-y-[4px]",
  lg: "h-14 text-base border-b-[4px] active:translate-y-[4px]",
  xl: "h-16 text-lg border-b-[6px] active:translate-y-[6px]",
};

export function ChunkyButton({
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  fullWidth = false,
  children,
  ...props
}: ChunkyButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-extrabold uppercase tracking-wide rounded-2xl transition-all active:border-b-0 outline-none focus:ring-4 focus:ring-black/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:border-b-[inherit] disabled:active:translate-y-0",
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? "w-full" : "w-auto px-6",
        className,
      )}
      {...props}
    >
      {Icon && (
        <Icon
          className={cn("mr-2", size === "xl" ? "w-6 h-6" : "w-5 h-5")}
          strokeWidth={3}
        />
      )}
      {children}
    </button>
  );
}

