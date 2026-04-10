"use client";

import { TrendingUp, DollarSign, Zap, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  const progressColor =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-indigo-600";

  const stats = [
    {
      label: "Total Spend",
      value: formatCurrency(totalCost),
      sub: `${pct.toFixed(1)}% of ${formatCurrency(spendLimit)} limit`,
      icon: DollarSign,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      label: "Budget Remaining",
      value: formatCurrency(Math.max(0, spendLimit - totalCost)),
      sub: `${(100 - pct).toFixed(1)}% available`,
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Input Tokens",
      value: formatTokens(totalInputTokens),
      sub: `${usage.summary.recordCount} API calls`,
      icon: Database,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Output Tokens",
      value: formatTokens(totalOutputTokens),
      sub: `${((totalOutputTokens / Math.max(1, totalInputTokens + totalOutputTokens)) * 100).toFixed(0)}% of total tokens`,
      icon: Zap,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Budget bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCost)} spent</p>
              <p className="text-sm text-gray-500">{dateLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{pct.toFixed(1)}% used</p>
              <p className="text-sm text-gray-500">of {formatCurrency(spendLimit)} limit</p>
            </div>
          </div>
          <Progress value={pct} colorClass={progressColor} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>$0</span>
            <span>{formatCurrency(spendLimit)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{s.label}</p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{s.value}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{s.sub}</p>
                </div>
                <div className={`p-2 rounded-lg ${s.iconBg}`}>
                  <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
