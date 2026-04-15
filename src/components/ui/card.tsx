import { cn } from "@/lib/utils";

type CardTone = "default" | "green" | "green-dark" | "coral" | "yellow" | "purple" | "mint";

const toneClasses: Record<CardTone, string> = {
  default: "bg-white border-[color:var(--kw-border)] text-[color:var(--kw-text)]",
  green: "bg-[color:var(--kw-green)] border-transparent text-white",
  "green-dark": "bg-[color:var(--kw-green-dark)] border-transparent text-white",
  coral: "bg-[color:var(--kw-coral)] border-transparent text-white",
  yellow: "bg-[color:var(--kw-yellow)] border-transparent text-[color:var(--kw-green-dark)]",
  purple: "bg-[color:var(--kw-purple)] border-transparent text-white",
  mint: "bg-[color:var(--kw-mint)] border-transparent text-[color:var(--kw-green-dark)]",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

export function Card({ className, tone = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border shadow-[0_1px_2px_rgba(27,66,57,0.04),0_12px_40px_-24px_rgba(27,66,57,0.16)]",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-7 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-heading font-bold tracking-tight text-[17px] leading-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-[color:var(--kw-text-muted)]", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-7 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-7 pt-0", className)} {...props} />;
}
