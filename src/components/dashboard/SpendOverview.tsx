"use client";

import { TrendingUp, DollarSign, Zap, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatTokens } from "@/lib/utils";
import type { UsageData } from "@/hooks/useDashboardData";

interface SpendOverviewProps {
  usage: UsageData;
  spendLimit?: number;
  dateLabel: string;
}

export function SpendOverview({ usage, spendLimit = 2000, dateLabel }: SpendOverviewProps) {
  const { totalCost, totalInputTokens, totalOutputTokens } = usage.summary;
  const pct = Math.min(100, (totalCost / spendLimit) * 100);

  // KW semantic progress tones — coral for alert, yellow for caution, green for healthy
  const progressTone: "coral" | "yellow" | "green" =
    pct >= 90 ? "coral" : pct >= 70 ? "yellow" : "green";

  const stats = [
    {
      label: "Total Spend",
      value: formatCurrency(totalCost),
      sub: `${pct.toFixed(1)}% of ${formatCurrency(spendLimit)} limit`,
      icon: DollarSign,
      tone: "green" as const,
    },
    {
      label: "Budget Remaining",
      value: formatCurrency(Math.max(0, spendLimit - totalCost)),
      sub: `${(100 - pct).toFixed(1)}% available`,
      icon: TrendingUp,
      tone: "mint" as const,
    },
    {
      label: "Input Tokens",
      value: formatTokens(totalInputTokens),
      sub: `${usage.summary.recordCount.toLocaleString()} API calls`,
      icon: Database,
      tone: "purple" as const,
    },
    {
      label: "Output Tokens",
      value: formatTokens(totalOutputTokens),
      sub: `${((totalOutputTokens / Math.max(1, totalInputTokens + totalOutputTokens)) * 100).toFixed(0)}% of total`,
      icon: Zap,
      tone: "yellow" as const,
    },
  ];

  const toneBg: Record<string, string> = {
    green: "bg-[color:var(--kw-green)]/10 text-[color:var(--kw-green-dark)]",
    mint: "bg-[color:var(--kw-mint)]/30 text-[color:var(--kw-mint-dark)]",
    purple: "bg-[color:var(--kw-purple)]/10 text-[color:var(--kw-purple-dark)]",
    yellow: "bg-[color:var(--kw-yellow-light)]/50 text-[color:var(--kw-green-dark)]",
  };

  return (
    <div className="space-y-5">
      {/* Hero spend card — signature dark-green grid background */}
      <div className="relative overflow-hidden rounded-[36px] kw-grid text-white shadow-[0_20px_60px_-30px_rgba(27,66,57,0.5)]">
        {/* Decorative dots cluster (top right) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-8 h-64 w-64 opacity-40"
        >
          <span
            className="kw-dot absolute top-20 right-20 h-4 w-4"
            style={{ color: "#FFB500" }}
          />
          <span
            className="kw-dot absolute top-32 right-40 h-2.5 w-2.5"
            style={{ color: "#FFB500" }}
          />
          <span
            className="kw-dot absolute top-44 right-16 h-3 w-3"
            style={{ color: "#FFD166" }}
          />
          <span
            className="kw-dot absolute top-12 right-48 h-2 w-2"
            style={{ color: "#FFB500" }}
          />
        </div>

        <div className="relative p-8 sm:p-10">
          <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] font-semibold text-[color:var(--kw-mint)] mb-2">
                Usage &amp; Spend Limits
              </p>
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-5xl sm:text-6xl font-heading font-bold tracking-tight">
                  {formatCurrency(totalCost)}
                </p>
                <p className="text-lg text-white/70 font-medium">spent</p>
              </div>
              <p className="text-sm text-white/70 mt-2">{dateLabel}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-3xl font-bold">{pct.toFixed(0)}%</p>
              <p className="text-sm text-white/70">
                of {formatCurrency(spendLimit)} limit
              </p>
            </div>
          </div>

          {/* Budget bar with KW styling */}
          <div className="h-3 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${pct}%`,
                backgroundColor:
                  progressTone === "coral"
                    ? "var(--kw-coral)"
                    : progressTone === "yellow"
                      ? "var(--kw-yellow)"
                      : "var(--kw-mint)",
              }}
            />
          </div>
          <div className="flex justify-between mt-2.5 text-[11px] text-white/50 font-medium tracking-wide">
            <span>$0</span>
            <span>{formatCurrency(spendLimit)}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-7">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-2xl ${toneBg[s.tone]} flex items-center justify-center`}
                >
                  <s.icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                </div>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--kw-text-muted)]">
                {s.label}
              </p>
              <p className="mt-1 text-2xl font-heading font-bold text-[color:var(--kw-green-dark)]">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-[color:var(--kw-text-muted)]">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
