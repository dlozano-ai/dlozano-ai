import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-full border border-[color:var(--kw-border-strong)] bg-white px-5 py-2 text-sm",
        "text-[color:var(--kw-text)] placeholder:text-[color:var(--kw-text-faint)]",
        "transition-colors shadow-[inset_0_1px_0_rgba(27,66,57,0.04)]",
        "focus-visible:outline-none focus-visible:border-[color:var(--kw-green)] focus-visible:ring-2 focus-visible:ring-[color:var(--kw-green)]/20",
        "disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
