import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "cyan" | "purple" | "green" | "amber" | "red" | "ghost";
  size?: "xs" | "sm";
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
  dot,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium font-body tracking-wide",
        size === "xs" && "px-1.5 py-0.5 text-[10px]",
        size === "sm" && "px-2 py-0.5 text-xs",
        variant === "default" && "bg-[#1e2433] text-[#94a3b8] border border-[#2a3347]",
        variant === "cyan" &&
          "bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/20",
        variant === "purple" &&
          "bg-[#8b5cf6]/10 text-[#8b5cf6] border border-[#8b5cf6]/20",
        variant === "green" &&
          "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20",
        variant === "amber" &&
          "bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20",
        variant === "red" &&
          "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20",
        variant === "ghost" && "text-[#475569]",
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "cyan" && "bg-[#00d4ff]",
            variant === "green" && "bg-[#00ff88]",
            variant === "amber" && "bg-[#f59e0b]",
            variant === "red" && "bg-[#ef4444]",
            variant === "purple" && "bg-[#8b5cf6]",
            variant === "default" && "bg-[#94a3b8]",
            variant === "ghost" && "bg-[#475569]"
          )}
        />
      )}
      {children}
    </span>
  );
}

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Chip({ children, active, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-body transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]/50",
        active
          ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
          : "bg-[#1e2433] text-[#94a3b8] border border-[#1e2433] hover:border-[#2a3347] hover:text-[#e2e8f0]",
        className
      )}
    >
      {children}
    </button>
  );
}
