"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  getDayLabel,
  getModelDisplayName,
  formatCurrency,
  getUserColor,
  KW_CHART_COLORS,
} from "@/lib/utils";
import type { UsageData } from "@/hooks/useDashboardData";

interface UsageChartProps {
  usage: UsageData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltipValue(value: any) {
  return formatCurrency(Number(value ?? 0));
}

// Branded tooltip look & feel (white pill with green accent)
const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid rgba(27,66,57,0.12)",
  borderRadius: 16,
  boxShadow: "0 12px 40px -16px rgba(27,66,57,0.25)",
  fontSize: 13,
  padding: "8px 12px",
} as const;

const tooltipLabelStyle = {
  color: "#1B4239",
  fontWeight: 600,
  marginBottom: 2,
} as const;

const axisTick = { fontSize: 11, fill: "rgba(27, 66, 57, 0.55)", fontWeight: 500 };

export function DailySpendChart({ usage }: UsageChartProps) {
  const data = usage.byDay.map((d) => ({
    date: getDayLabel(d.date),
    cost: parseFloat(d.cost.toFixed(4)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Spend</CardTitle>
        <CardDescription>Cost per day across the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="kwCostGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E6661" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2E6661" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(27,66,57,0.08)" />
            <XAxis
              dataKey="date"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={44}
            />
            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ stroke: "#2E6661", strokeWidth: 1, strokeOpacity: 0.2 }}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#2E6661"
              strokeWidth={2.5}
              fill="url(#kwCostGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#FFB500", stroke: "#2E6661", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ModelBreakdownChart({ usage }: UsageChartProps) {
  const data = usage.byModel.slice(0, 6).map((m, i) => ({
    name: getModelDisplayName(m.model),
    cost: parseFloat(m.cost.toFixed(4)),
    fill: getUserColor(i),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spend by Model</CardTitle>
        <CardDescription>Total cost broken down per Claude model</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 8 }}
            layout="vertical"
            barCategoryGap={10}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(27,66,57,0.08)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ ...axisTick, fill: "rgba(27, 66, 57, 0.8)" }}
              tickLine={false}
              axisLine={false}
              width={140}
            />
            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: "rgba(46, 102, 97, 0.06)" }}
            />
            <Bar dataKey="cost" radius={[0, 10, 10, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SpendPieChart({ usage }: UsageChartProps) {
  const data = usage.byModel.slice(0, 5).map((m, i) => ({
    name: getModelDisplayName(m.model),
    value: parseFloat(m.cost.toFixed(4)),
    fill: KW_CHART_COLORS[i % KW_CHART_COLORS.length],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Distribution</CardTitle>
        <CardDescription>Share of spend across top models</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={56}
              outerRadius={88}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={formatTooltipValue}
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
              formatter={(value) => (
                <span style={{ color: "rgba(27, 66, 57, 0.75)", fontWeight: 500 }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
