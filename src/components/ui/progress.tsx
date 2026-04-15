import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  /**
   * KindWorks.AI semantic tones.
   * - green (default) = healthy / on track
   * - yellow = caution / near limit
   * - coral = alert / over limit
   * - mint = soft data / informational
   */
  tone?: "green" | "yellow" | "coral" | "mint";
}

const toneClasses: Record<NonNullable<ProgressProps["tone"]>, string> = {
  green: "bg-[color:var(--kw-green)]",
  yellow: "bg-[color:var(--kw-yellow)]",
  coral: "bg-[color:var(--kw-coral)]",
  mint: "bg-[color:var(--kw-mint-dark)]",
};

export function Progress({
  value,
  tone = "green",
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--kw-green)]/10",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          toneClasses[tone]
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
