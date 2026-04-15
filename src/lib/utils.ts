import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(1)}B`;
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toString();
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function getModelDisplayName(modelId: string): string {
  const map: Record<string, string> = {
    "claude-opus-4-5": "Claude Opus 4.5",
    "claude-sonnet-4-5": "Claude Sonnet 4.5",
    "claude-haiku-4-5": "Claude Haiku 4.5",
    "claude-opus-4-0": "Claude Opus 4",
    "claude-sonnet-4-0": "Claude Sonnet 4",
    "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
    "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet (Jun)",
    "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
    "claude-3-opus-20240229": "Claude 3 Opus",
    "claude-3-sonnet-20240229": "Claude 3 Sonnet",
    "claude-3-haiku-20240307": "Claude 3 Haiku",
  };
  return map[modelId] ?? modelId;
}

export function getModelFamily(modelId: string): string {
  if (modelId.includes("opus")) return "Opus";
  if (modelId.includes("sonnet")) return "Sonnet";
  if (modelId.includes("haiku")) return "Haiku";
  return "Other";
}

export function startOfMonth(date: Date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}

export function endOfMonth(date: Date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
}

export function startOf30DaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

export function getDayLabel(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// KindWorks.AI chart palette — ordered by brand preference
// Green leads (data foundation), then yellow (warmth), coral (bold),
// purple (inspiration), mint (soft data), then darker/lighter variants.
export const KW_CHART_COLORS = [
  "#2E6661", // green (data)
  "#FFB500", // yellow (warmth)
  "#FF474A", // coral (bold)
  "#9C338C", // purple (inspiration)
  "#8FE0BF", // mint (soft data)
  "#1B4239", // dark green
  "#4DAE97", // dark mint
  "#FFD166", // light yellow
  "#FF8484", // light coral
  "#6F0E60", // dark purple
] as const;

export function getUserColor(index: number): string {
  return KW_CHART_COLORS[index % KW_CHART_COLORS.length];
}
