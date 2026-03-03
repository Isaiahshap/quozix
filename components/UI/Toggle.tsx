"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
  className,
}: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex flex-shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
          size === "sm" && "w-8 h-4",
          size === "md" && "w-10 h-5",
          checked
            ? "bg-[#00d4ff]"
            : "bg-[#1e2433] border border-[#2a3347]"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
          className={cn(
            "absolute top-0.5 rounded-full bg-white shadow",
            size === "sm" && "w-3 h-3",
            size === "md" && "w-4 h-4",
            checked
              ? size === "sm" ? "left-[calc(100%-14px)]" : "left-[calc(100%-18px)]"
              : "left-0.5"
          )}
        />
      </button>
      {label && (
        <span className="text-sm text-[#94a3b8] font-body">{label}</span>
      )}
    </label>
  );
}
