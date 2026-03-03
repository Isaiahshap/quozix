"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "glow";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none font-body",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
          size === "xs" && "px-2.5 py-1 text-xs",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-5 py-2.5 text-base",
          variant === "primary" &&
            "bg-[#00d4ff] text-[#08090c] hover:bg-[#00bbdd] active:bg-[#009dbf] font-semibold",
          variant === "secondary" &&
            "bg-[#1e2433] text-[#e2e8f0] hover:bg-[#2a3347] border border-[#2a3347] hover:border-[#3a4560]",
          variant === "ghost" &&
            "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e2433]/60",
          variant === "danger" &&
            "bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 border border-[#ef4444]/20",
          variant === "glow" &&
            "bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 shadow-[0_0_12px_rgba(0,212,255,0.1)]",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "xs" | "sm" | "md" | "lg";
  active?: boolean;
  "aria-label": string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "md", active, className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref as React.Ref<HTMLButtonElement>}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          size === "xs" && "w-6 h-6",
          size === "sm" && "w-7 h-7",
          size === "md" && "w-8 h-8",
          size === "lg" && "w-10 h-10",
          active
            ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
            : "bg-[#1e2433]/60 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e2433] border border-transparent hover:border-[#2a3347]",
          className
        )}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {children}
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
