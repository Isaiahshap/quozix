import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none">
            {icon}
          </span>
          <input
            ref={ref}
            className={cn(
              "w-full bg-[#12141a] border border-[#1e2433] text-[#e2e8f0] rounded-lg pl-9 pr-3 py-2 text-sm",
              "placeholder:text-[#475569] font-body",
              "focus:outline-none focus:border-[#00d4ff]/40 focus:ring-1 focus:ring-[#00d4ff]/20",
              "transition-colors duration-150",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-[#12141a] border border-[#1e2433] text-[#e2e8f0] rounded-lg px-3 py-2 text-sm",
          "placeholder:text-[#475569] font-body",
          "focus:outline-none focus:border-[#00d4ff]/40 focus:ring-1 focus:ring-[#00d4ff]/20",
          "transition-colors duration-150",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchInput(props: SearchInputProps) {
  return <Input icon={<Search className="w-4 h-4" />} {...props} />;
}
