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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDayLabel, getModelDisplayName, formatCurrency, getUserColor } from "@/lib/utils";
import type { UsageData } from "@/hooks/useDashboardData";

interface UsageChartProps {
  usage: UsageData;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTooltipValue(value: any) {
  return formatCurrency(Number(value ?? 0));
}

export function DailySpendChart({ usage }: UsageChartProps) {
  const data = usage.byDay.map((d) => ({
    date: getDayLabel(d.date),
    cost: parseFloat(d.cost.toFixed(4)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              width={40}
            />
            <Tooltip formatter={formatTooltipValue} labelStyle={{ color: "#374151" }} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#costGradient)"
              dot={false}
              activeDot={{ r: 4 }}
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
        <CardTitle className="text-base">Spend by Model</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 40 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <Tooltip formatter={formatTooltipValue} labelStyle={{ color: "#374151" }} />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
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
    fill: getUserColor(i),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Model Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={formatTooltipValue} />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              formatter={(value) => (
                <span style={{ color: "#6b7280" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
