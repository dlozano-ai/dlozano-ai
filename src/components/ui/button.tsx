import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "yellow";
  size?: "sm" | "md" | "lg";
}

/**
 * KindWorks.AI button styles.
 * - primary: yellow pill + dark green text (brand primary CTA)
 * - secondary: white pill with green border + green text
 * - ghost: transparent, green text, subtle hover
 * - danger: coral pill + white text
 * - yellow: alias of primary (kept for clarity at call sites)
 */
const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[color:var(--kw-yellow)] text-[color:var(--kw-green-dark)] hover:bg-[color:var(--kw-yellow-light)] shadow-[0_1px_0_rgba(27,66,57,0.08)]",
  yellow:
    "bg-[color:var(--kw-yellow)] text-[color:var(--kw-green-dark)] hover:bg-[color:var(--kw-yellow-light)] shadow-[0_1px_0_rgba(27,66,57,0.08)]",
  secondary:
    "bg-white text-[color:var(--kw-green-dark)] border border-[color:var(--kw-border-strong)] hover:border-[color:var(--kw-green)] hover:bg-[color:var(--kw-green)]/5",
  ghost:
    "text-[color:var(--kw-green-dark)] hover:bg-[color:var(--kw-green)]/8",
  danger:
    "bg-[color:var(--kw-coral)] text-white hover:bg-[color:var(--kw-coral-light)]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export function Button({
  className,
  variant = "secondary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--kw-green)] focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none active:translate-y-[1px]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}
