"use client";

import { AlertTriangle, Award, TrendingUp, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTokens, getModelDisplayName } from "@/lib/utils";
import type { UsageData, Member } from "@/hooks/useDashboardData";

interface InsightCardsProps {
  usage: UsageData;
  members: Member[];
}

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
  const avgDailySpend = usage.byDay.length > 0
    ? usage.summary.totalCost / usage.byDay.length
    : 0;

  // Find member name for top api key
  const topMemberName =
    members.find((m) => m.id === topApiKey?.api_key_id)?.name ??
    topApiKey?.api_key_id?.slice(0, 12) ?? "Unknown";

  const insights = [
    {
      title: "Top Model",
      icon: Layers,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      primary: topModel ? getModelDisplayName(topModel.model) : "—",
      secondary: topModel ? formatCurrency(topModel.cost) : "No data",
      badge: topModel
        ? `${formatTokens(topModel.input_tokens + topModel.output_tokens)} tokens`
        : undefined,
      badgeVariant: "default" as const,
    },
    {
      title: "Top Spender",
      icon: Award,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      primary: topMemberName,
      secondary: topApiKey ? formatCurrency(topApiKey.cost) : "No data",
      badge: topApiKey
        ? `${((topApiKey.cost / Math.max(0.01, usage.summary.totalCost)) * 100).toFixed(0)}% of total`
        : undefined,
      badgeVariant: "warning" as const,
    },
    {
      title: "Avg Daily Spend",
      icon: TrendingUp,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      primary: formatCurrency(avgDailySpend),
      secondary: `over ${usage.byDay.length} day${usage.byDay.length !== 1 ? "s" : ""}`,
      badge: undefined,
      badgeVariant: "default" as const,
    },
    {
      title: "Projected Monthly",
      icon: AlertTriangle,
      iconBg: projectedMonthly > 1800 ? "bg-red-50" : "bg-green-50",
      iconColor: projectedMonthly > 1800 ? "text-red-600" : "text-green-600",
      primary: formatCurrency(projectedMonthly),
      secondary: `at current burn rate`,
      badge: projectedMonthly > 2000 ? "Over limit" : projectedMonthly > 1600 ? "Near limit" : "On track",
      badgeVariant: (projectedMonthly > 2000 ? "danger" : projectedMonthly > 1600 ? "warning" : "success") as
        | "danger"
        | "warning"
        | "success",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {insights.map((ins) => (
        <Card key={ins.title}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${ins.iconBg}`}>
                <ins.icon className={`h-4 w-4 ${ins.iconColor}`} />
              </div>
              <CardTitle className="text-sm text-gray-500 font-medium">{ins.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-gray-900 truncate">{ins.primary}</p>
            <p className="text-xs text-gray-500 mt-0.5">{ins.secondary}</p>
            {ins.badge && (
              <Badge variant={ins.badgeVariant} className="mt-2">
                {ins.badge}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
