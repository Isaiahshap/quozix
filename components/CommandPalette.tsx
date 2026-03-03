"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, Tv2, Radio, Radar, Info, LayoutDashboard, Zap, X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  category: string;
}

const NAVIGATION_ITEMS: CommandItem[] = [
  { id: "nav-dashboard", label: "Dashboard", description: "Overview & stats", icon: <LayoutDashboard className="w-4 h-4" />, href: "/", category: "Navigate" },
  { id: "nav-globe", label: "Globe View", description: "3D interactive OSINT globe", icon: <Globe className="w-4 h-4" />, href: "/globe", category: "Navigate" },
  { id: "nav-streams", label: "Live TV", description: "Browse & watch live streams", icon: <Tv2 className="w-4 h-4" />, href: "/streams", category: "Navigate" },
  { id: "nav-radio", label: "Radio", description: "International radio stations", icon: <Radio className="w-4 h-4" />, href: "/radio", category: "Navigate" },
  { id: "nav-intel", label: "Intel Feed", description: "OSINT news signals", icon: <Radar className="w-4 h-4" />, href: "/intel", category: "Navigate" },
  { id: "nav-sources", label: "Sources & Terms", description: "Data sources & legal", icon: <Info className="w-4 h-4" />, href: "/sources", category: "Navigate" },
];

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open with Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) onClose();
        else {
          // trigger open from parent
        }
      }
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = NAVIGATION_ITEMS.filter(
    (item) =>
      !query ||
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const execute = (item: CommandItem) => {
    if (item.href) router.push(item.href);
    if (item.action) item.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((p) => Math.min(p + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((p) => Math.max(p - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      execute(filtered[selected]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-[560px] pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              <div className="bg-[#0d0f14] border border-[#1e2433] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.8)] overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2433]">
                  <Search className="w-4 h-4 text-[#475569] flex-shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search pages, features..."
                    className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder:text-[#475569] font-body outline-none"
                    aria-label="Command search"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    onClick={onClose}
                    className="text-[#475569] hover:text-[#94a3b8] transition-colors"
                    aria-label="Close command palette"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto py-1.5">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-[#475569] font-body">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  ) : (
                    <>
                      {/* Group by category */}
                      {["Navigate", "Actions"].map((cat) => {
                        const items = filtered.filter((i) => i.category === cat);
                        if (items.length === 0) return null;
                        return (
                          <div key={cat}>
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-[#475569] uppercase tracking-widest font-heading">
                              {cat}
                            </div>
                            {items.map((item, idx) => {
                              const globalIdx = filtered.indexOf(item);
                              return (
                                <motion.button
                                  key={item.id}
                                  whileHover={{ x: 2 }}
                                  onClick={() => execute(item)}
                                  onMouseEnter={() => setSelected(globalIdx)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                                    globalIdx === selected
                                      ? "bg-[#00d4ff]/10 text-[#00d4ff]"
                                      : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e2433]/50"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex-shrink-0",
                                      globalIdx === selected ? "text-[#00d4ff]" : "text-[#475569]"
                                    )}
                                  >
                                    {item.icon}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium font-body">
                                      {item.label}
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-[#475569] mt-0.5">
                                        {item.description}
                                      </div>
                                    )}
                                  </div>
                                  {globalIdx === selected && (
                                    <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-[#1e2433] flex items-center gap-4 text-[10px] text-[#475569] font-body">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[#1e2433] rounded text-[9px]">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[#1e2433] rounded text-[9px]">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-[#1e2433] rounded text-[9px]">Esc</kbd>
                    close
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 text-[#00d4ff]" />
                    Quozix
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
