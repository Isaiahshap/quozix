"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Topbar } from "./Topbar";
import { Sidebar, BottomNav } from "./Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openSearch = useCallback(() => setCommandPaletteOpen(true), []);
  const closeSearch = useCallback(() => setCommandPaletteOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((p) => !p);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090c]">
      {/* Grain overlay */}
      <div className="grain-overlay" aria-hidden="true" />

      {/* Topbar */}
      <Topbar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        onOpenSearch={openSearch}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main
        className={cn(
          "pt-12 pb-14 lg:pb-0 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:pl-14" : "lg:pl-[200px]"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={typeof window !== "undefined" ? window.location.pathname : ""}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />

      {/* Command palette */}
      <CommandPalette open={commandPaletteOpen} onClose={closeSearch} />
    </div>
  );
}
