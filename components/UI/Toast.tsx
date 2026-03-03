"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (toast: Omit<Toast, "id">) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = String(++counterRef.current);
      setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
      setTimeout(() => remove(id), t.duration ?? 4000);
    },
    [remove]
  );

  const success = useCallback((message: string) => toast({ type: "success", message }), [toast]);
  const error = useCallback((message: string) => toast({ type: "error", message }), [toast]);
  const warning = useCallback((message: string) => toast({ type: "warning", message }), [toast]);
  const info = useCallback((message: string) => toast({ type: "info", message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="w-4 h-4 text-[#00ff88] flex-shrink-0" />,
    error: <XCircle className="w-4 h-4 text-[#ef4444] flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-[#00d4ff] flex-shrink-0" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "pointer-events-auto flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-xl",
        "bg-[#0e1118] border border-[#1e2433] shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
        "min-w-[280px] max-w-sm"
      )}
    >
      {icons[toast.type]}
      <p className="text-sm text-[#e2e8f0] font-body flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="w-5 h-5 flex items-center justify-center rounded text-[#475569] hover:text-[#e2e8f0] transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
