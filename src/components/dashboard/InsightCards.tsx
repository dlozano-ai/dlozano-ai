"use client";

import { AlertTriangle, Award, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTokens, getModelDisplayName } from "@/lib/utils";
import type { UsageData, Member } from "@/hooks/useDashboardData";

interface InsightCardsProps {
  usage: UsageData;
  members: Member[];
}

type Tone = "green" | "yellow" | "mint" | "purple" | "coral";

export function InsightCards({ usage, members }: InsightCardsProps) {
  const topModel = usage.byModel[0];
  const topApiKey = usage.byApiKey[0];

  // Project end-of-month spend based on current daily burn
  const today = new Date();
  const dayOfMonth = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const projectedMonthly =
    dayOfMonth > 0 ? (usage.summary.totalCost / dayOfMonth) * daysInMonth : 0;

  // Average daily spend
  const avgDailySpend =
    usage.byDay.length > 0 ? usage.summary.totalCost / usage.byDay.length : 0;

  const topMemberName =
    members.find((m) => m.id === topApiKey?.api_key_id)?.name ??
    topApiKey?.api_key_id?.slice(0, 12) ??
    "Unknown";

  // Per-brand: purple = inspiration/useful content, yellow = warmth/celebration,
  // mint = soft data/research, coral = bold statement, green = hard data
  const insights: {
    title: string;
    icon: typeof Layers;
    tone: Tone;
    primary: string;
    secondary: string;
    badge?: string;
    badgeTone: Tone;
  }[] = [
    {
      title: "Top Model",
      icon: Layers,
      tone: "mint", // soft data / cited research
      primary: topModel ? getModelDisplayName(topModel.model) : "—",
      secondary: topModel ? formatCurrency(topModel.cost) : "No data",
      badge: topModel
        ? `${formatTokens(topModel.input_tokens + topModel.output_tokens)} tokens`
        : undefined,
      badgeTone: "mint",
    },
    {
      title: "Top Spender",
      icon: Award,
      tone: "yellow", // celebration / warmth
      primary: topMemberName,
      secondary: topApiKey ? formatCurrency(topApiKey.cost) : "No data",
      badge: topApiKey
        ? `${((topApiKey.cost / Math.max(0.01, usage.summary.totalCost)) * 100).toFixed(0)}% of total`
        : undefined,
      badgeTone: "yellow",
    },
    {
      title: "Avg Daily Spend",
      icon: TrendingUp,
      tone: "green", // hard data / proof point
      primary: formatCurrency(avgDailySpend),
      secondary: `over ${usage.byDay.length} day${usage.byDay.length !== 1 ? "s" : ""}`,
      badgeTone: "green",
    },
    {
      title: "Projected Monthly",
      icon: AlertTriangle,
      tone: projectedMonthly > 2000 ? "coral" : projectedMonthly > 1600 ? "yellow" : "purple",
      primary: formatCurrency(projectedMonthly),
      secondary: `at current burn rate`,
      badge:
        projectedMonthly > 2000
          ? "Over limit"
          : projectedMonthly > 1600
            ? "Near limit"
            : "On track",
      badgeTone:
        projectedMonthly > 2000 ? "coral" : projectedMonthly > 1600 ? "yellow" : "purple",
    },
  ];

  const toneIcon: Record<Tone, string> = {
    green: "bg-[color:var(--kw-green)]/10 text-[color:var(--kw-green-dark)]",
    mint: "bg-[color:var(--kw-mint)]/40 text-[color:var(--kw-green-dark)]",
    yellow: "bg-[color:var(--kw-yellow-light)]/60 text-[color:var(--kw-green-dark)]",
    purple: "bg-[color:var(--kw-purple)]/10 text-[color:var(--kw-purple-dark)]",
    coral: "bg-[color:var(--kw-coral)]/10 text-[color:var(--kw-coral)]",
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {insights.map((ins) => (
        <Card key={ins.title} className="relative overflow-hidden">
          {/* A soft 'dot' accent in the corner — brand signature */}
          <span
            aria-hidden
            className={`absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-40 ${
              {
                green: "bg-[color:var(--kw-green)]/8",
                mint: "bg-[color:var(--kw-mint)]/25",
                yellow: "bg-[color:var(--kw-yellow)]/15",
                purple: "bg-[color:var(--kw-purple)]/8",
                coral: "bg-[color:var(--kw-coral)]/8",
              }[ins.tone]
            }`}
          />
          <CardContent className="pt-7 relative">
            <div
              className={`inline-flex items-center justify-center p-2.5 rounded-2xl ${toneIcon[ins.tone]}`}
            >
              <ins.icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[color:var(--kw-text-muted)]">
              {ins.title}
            </p>
            <p className="mt-1 text-xl font-heading font-bold text-[color:var(--kw-green-dark)] truncate">
              {ins.primary}
            </p>
            <p className="text-xs text-[color:var(--kw-text-muted)] mt-0.5">
              {ins.secondary}
            </p>
            {ins.badge && (
              <Badge variant={ins.badgeTone} className="mt-3">
                {ins.badge}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
