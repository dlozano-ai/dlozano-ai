import { cn } from "@/lib/utils";

interface KWLogoProps {
  className?: string;
  variant?: "full" | "mark";
  color?: "green" | "white" | "coral" | "black";
}

/**
 * KindWorks.AI logo mark.
 *
 * Per brand guide: a rounded "K" with a superscript ".AI" — representing
 * the exponential power of Kindness. This is a CSS/SVG approximation of
 * the mark using brand-approved colors and the primary type family.
 *
 * Use `variant="mark"` for favicons / small spots (pill-shaped K).
 * Use `variant="full"` alongside the wordmark "KindWorks" + ".AI" superscript.
 */
export function KWLogo({ className, variant = "full", color = "green" }: KWLogoProps) {
  const colors = {
    green: "var(--kw-green)",
    white: "#fff",
    coral: "var(--kw-coral)",
    black: "var(--kw-black)",
  } as const;
  const fg = colors[color];

  if (variant === "mark") {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-heading font-bold leading-none select-none",
          className
        )}
        style={{ backgroundColor: fg, color: "var(--kw-yellow)" }}
        aria-label="KindWorks.AI"
      >
        <span className="relative">
          K
          <span
            className="absolute -top-1 -right-2 text-[0.4em] font-bold"
            style={{ color: "var(--kw-yellow)" }}
          >
            ·AI
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-heading font-bold leading-none tracking-tight select-none",
        className
      )}
      style={{ color: fg }}
      aria-label="KindWorks.AI"
    >
      <span className="relative">
        KindWorks
        <span
          className="absolute left-full -top-0.5 ml-0.5 text-[0.5em] font-bold"
          style={{ color: "var(--kw-coral)" }}
        >
          .AI
        </span>
      </span>
    </span>
  );
}
