"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Menu, X, Zap, Radio, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/UI/Button";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className={cn(
      "relative inline-flex w-2 h-2 rounded-full",
      ok ? "bg-[#00ff88]" : "bg-[#ef4444]"
    )}>
      {ok && (
        <span className="absolute inset-0 rounded-full bg-[#00ff88] animate-ping opacity-60" />
      )}
    </span>
  );
}

export function Topbar({ sidebarOpen, onToggleSidebar, onOpenSearch }: TopbarProps) {
  const [online, setOnline] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "UTC",
        }) + " UTC"
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-12 flex items-center px-3 gap-3 bg-[#08090c]/95 backdrop-blur-md border-b border-[#1e2433]">
      {/* Logo + hamburger */}
      <div className="flex items-center gap-2 min-w-0">
        <IconButton
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          size="sm"
          className="lg:hidden flex-shrink-0"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </IconButton>
        <Link
          href="/"
          className="flex items-center gap-1.5 group focus-visible:outline-none"
          aria-label="Quozix home"
        >
          <div className="w-6 h-6 rounded bg-[#00d4ff]/15 border border-[#00d4ff]/30 flex items-center justify-center flex-shrink-0 group-hover:border-[#00d4ff]/50 transition-colors">
            <Zap className="w-3.5 h-3.5 text-[#00d4ff]" />
          </div>
          <span className="font-heading font-bold text-sm tracking-widest text-[#e2e8f0] hidden sm:block group-hover:text-[#00d4ff] transition-colors">
            QUOZIX
          </span>
        </Link>
      </div>

      {/* Search bar */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        onClick={onOpenSearch}
        className="flex-1 max-w-md flex items-center gap-2.5 h-7 px-3 rounded-lg bg-[#12141a] border border-[#1e2433] hover:border-[#2a3347] text-[#475569] hover:text-[#94a3b8] transition-colors text-xs font-body cursor-pointer"
        aria-label="Open search (Cmd+K)"
      >
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1 text-left hidden sm:block">Search channels, stations, signals...</span>
        <span className="hidden sm:flex items-center gap-1 flex-shrink-0">
          <kbd className="px-1 py-0.5 rounded bg-[#1e2433] text-[10px]">⌘</kbd>
          <kbd className="px-1 py-0.5 rounded bg-[#1e2433] text-[10px]">K</kbd>
        </span>
      </motion.button>

      {/* Status indicators */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-body text-[#475569]">
          {online ? (
            <Wifi className="w-3 h-3 text-[#00ff88]" />
          ) : (
            <WifiOff className="w-3 h-3 text-[#ef4444]" />
          )}
          <span className={online ? "text-[#00ff88]" : "text-[#ef4444]"}>
            {online ? "LIVE" : "OFFLINE"}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5">
          <StatusDot ok={true} />
          <span className="text-[10px] text-[#475569] font-mono tabular-nums">{time}</span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[10px] text-[#475569]">
          <Radio className="w-3 h-3 text-[#8b5cf6]" />
          <span className="font-mono">OSINT</span>
        </div>
      </div>
    </header>
  );
}
