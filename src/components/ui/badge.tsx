import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * KindWorks.AI semantic colors:
   * - green = data / proof points (default)
   * - mint  = cited research / soft data
   * - purple = inspiration / useful content
   * - yellow = warmth / celebrations
   * - coral = bold statements / warnings
   * - muted = neutral / low-emphasis
   */
  variant?: "green" | "mint" | "purple" | "yellow" | "coral" | "muted" | "default";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default:
    "bg-[color:var(--kw-green)]/10 text-[color:var(--kw-green-dark)] ring-[color:var(--kw-green)]/20",
  green:
    "bg-[color:var(--kw-green)]/10 text-[color:var(--kw-green-dark)] ring-[color:var(--kw-green)]/20",
  mint:
    "bg-[color:var(--kw-mint)]/30 text-[color:var(--kw-green-dark)] ring-[color:var(--kw-mint-dark)]/40",
  purple:
    "bg-[color:var(--kw-purple)]/10 text-[color:var(--kw-purple-dark)] ring-[color:var(--kw-purple)]/25",
  yellow:
    "bg-[color:var(--kw-yellow-light)]/50 text-[color:var(--kw-green-dark)] ring-[color:var(--kw-yellow)]/40",
  coral:
    "bg-[color:var(--kw-coral)]/10 text-[color:var(--kw-coral)] ring-[color:var(--kw-coral)]/25",
  muted:
    "bg-[color:var(--kw-black)]/5 text-[color:var(--kw-text-muted)] ring-[color:var(--kw-black)]/10",
};

export function Badge({ className, variant = "green", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
