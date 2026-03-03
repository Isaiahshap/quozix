"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface PanelProps extends HTMLMotionProps<"div"> {
  variant?: "solid" | "glass" | "bordered";
  glow?: "cyan" | "purple" | "none";
  children: React.ReactNode;
}

export const Panel = forwardRef<HTMLDivElement, PanelProps>(
  ({ variant = "solid", glow = "none", className, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl",
          variant === "solid" && "bg-[#0e1118] border border-[#1e2433]",
          variant === "glass" &&
            "bg-[#0e1118]/80 backdrop-blur-xl border border-[#1e2433]/80",
          variant === "bordered" &&
            "bg-[#0e1118] border-2 border-[#1e2433]",
          glow === "cyan" && "shadow-[0_0_20px_rgba(0,212,255,0.12),inset_0_1px_0_rgba(0,212,255,0.06)]",
          glow === "purple" && "shadow-[0_0_20px_rgba(139,92,246,0.12),inset_0_1px_0_rgba(139,92,246,0.06)]",
          glow === "none" && "shadow-[0_4px_24px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Panel.displayName = "Panel";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PanelHeader({ title, subtitle, action, icon }: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2433]">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="text-[#00d4ff] flex-shrink-0">{icon}</span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-[#e2e8f0] font-heading tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#475569] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
