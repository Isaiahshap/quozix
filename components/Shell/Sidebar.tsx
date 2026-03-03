"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Tv2,
  Radio,
  Radar,
  Info,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "cyan" },
  { href: "/globe", label: "Globe", icon: Globe, accent: "cyan" },
  { href: "/streams", label: "Live TV", icon: Tv2, accent: "purple" },
  { href: "/radio", label: "Radio", icon: Radio, accent: "purple" },
  { href: "/intel", label: "Intel", icon: Radar, accent: "amber" },
  { href: "/sources", label: "Sources", icon: Info, accent: "muted" },
] as const;

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export function Sidebar({ open, collapsed, onToggleCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium font-body transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
              active
                ? "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20"
                : "text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#1e2433]/60",
              collapsed && "justify-center px-2"
            )}
          >
            <Icon
              className={cn(
                "flex-shrink-0",
                collapsed ? "w-5 h-5" : "w-4 h-4",
                active
                  ? "text-[#00d4ff]"
                  : item.accent === "amber"
                  ? "text-[#f59e0b]/70"
                  : item.accent === "purple"
                  ? "text-[#8b5cf6]/70"
                  : "text-[#94a3b8]"
              )}
              aria-hidden="true"
            />
            {!collapsed && (
              <span className="truncate">{item.label}</span>
            )}
            {active && !collapsed && (
              <motion.span
                layoutId="nav-active"
                className="ml-auto w-1 h-1 rounded-full bg-[#00d4ff]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 200 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="hidden lg:flex flex-col fixed left-0 top-12 bottom-0 z-20 bg-[#0d0f14] border-r border-[#1e2433] overflow-hidden"
        aria-label="Sidebar"
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <div className="px-2 py-2 border-t border-[#1e2433]">
          <button
            onClick={onToggleCollapse}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[#475569] hover:text-[#94a3b8] hover:bg-[#1e2433]/60 transition-all",
              collapsed && "px-0"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile overlay sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -200 }}
              animate={{ x: 0 }}
              exit={{ x: -200 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-52 bg-[#0d0f14] border-r border-[#1e2433] flex flex-col lg:hidden pt-12"
              aria-label="Mobile navigation"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Mobile bottom nav
export function BottomNav() {
  const pathname = usePathname();

  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 h-14 flex items-center bg-[#08090c]/95 backdrop-blur-md border-t border-[#1e2433] lg:hidden px-2"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
              active ? "text-[#00d4ff]" : "text-[#475569] hover:text-[#94a3b8]"
            )}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-body">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
