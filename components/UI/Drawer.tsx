"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "./Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: "right" | "left" | "bottom";
  width?: "sm" | "md" | "lg";
}

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  side = "right",
  width = "md",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const slideVariants = {
    right: {
      initial: { x: "100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "100%", opacity: 0 },
    },
    left: {
      initial: { x: "-100%", opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: "-100%", opacity: 0 },
    },
    bottom: {
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: "100%", opacity: 0 },
    },
  };

  const variants = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <motion.div
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: "spring", damping: 32, stiffness: 400 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "fixed z-50 bg-[#0d0f14] border-[#1e2433] flex flex-col",
              side === "right" && "top-0 right-0 bottom-0 border-l",
              side === "left" && "top-0 left-0 bottom-0 border-r",
              side === "bottom" && "left-0 right-0 bottom-0 border-t rounded-t-2xl",
              side !== "bottom" && {
                sm: "w-80",
                md: "w-96 md:w-[480px]",
                lg: "w-full md:w-[640px]",
              }[width],
              side === "bottom" && "max-h-[85vh]"
            )}
          >
            {(title || subtitle) && (
              <div className="flex items-start justify-between p-4 border-b border-[#1e2433] flex-shrink-0">
                <div>
                  {title && (
                    <h2 className="text-base font-semibold text-[#e2e8f0] font-heading">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#475569] mt-0.5">{subtitle}</p>
                  )}
                </div>
                <IconButton
                  aria-label="Close drawer"
                  onClick={onClose}
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg bg-[#1e2433] text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
