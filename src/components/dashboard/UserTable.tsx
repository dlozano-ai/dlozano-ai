"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatTokens, getInitials, getUserColor } from "@/lib/utils";
import type { Member, ApiKeyUsage } from "@/hooks/useDashboardData";

interface UserTableProps {
  members: Member[];
  apiKeyUsage: ApiKeyUsage[];
  totalBudget: number;
}

interface UserRow {
  member: Member;
  spend: number;
  inputTokens: number;
  outputTokens: number;
  spendLimit: number;
  pct: number;
}

type SortKey = "name" | "spend" | "pct";

export function UserTable({ members, apiKeyUsage, totalBudget }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Build a map of member usage (in real usage, api_key_id would map to user)
  const usageMap = new Map<string, ApiKeyUsage>();
  for (const u of apiKeyUsage) usageMap.set(u.api_key_id, u);

  // Distribute usage across members (in production, exact mapping comes via API keys)

  const rows: UserRow[] = members.map((m, i) => {
    const usage = apiKeyUsage[i] ?? { cost: 0, input_tokens: 0, output_tokens: 0, api_key_id: m.id };
    const spendLimit = totalBudget / Math.max(1, members.length);
    const pct = Math.min(100, (usage.cost / spendLimit) * 100);
    return {
      member: m,
      spend: usage.cost,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
      spendLimit,
      pct,
    };
  });

  const sorted = [...rows]
    .filter(
      (r) =>
        !search ||
        r.member.name.toLowerCase().includes(search.toLowerCase()) ||
        r.member.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let diff = 0;
      if (sortKey === "name") diff = a.member.name.localeCompare(b.member.name);
      else if (sortKey === "spend") diff = a.spend - b.spend;
      else if (sortKey === "pct") diff = a.pct - b.pct;
      return sortDir === "desc" ? -diff : diff;
    });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "desc" ? (
        <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronUp className="h-3 w-3" />
      )
    ) : (
      <ChevronDown className="h-3 w-3 opacity-30" />
    );

  const roleBadge = (role: string) => {
    const v: Record<string, "default" | "warning" | "muted"> = {
      admin: "warning",
      developer: "default",
      billing: "muted",
      readonly: "muted",
    };
    return <Badge variant={v[role] ?? "muted"}>{role}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Spend by Member</CardTitle>
            <CardDescription className="mt-1">
              {members.length} members · MTD usage breakdown
            </CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => toggleSort("name")}
                  >
                    Member <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => toggleSort("spend")}
                  >
                    MTD Spend <SortIcon col="spend" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tokens Used</th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-500 hover:text-gray-700"
                    onClick={() => toggleSort("pct")}
                  >
                    Budget Used <SortIcon col="pct" />
                  </button>
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">Limit</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No members found
                  </td>
                </tr>
              )}
              {sorted.map((row, i) => {
                const progressColor =
                  row.pct >= 90 ? "bg-red-500" : row.pct >= 70 ? "bg-amber-500" : "bg-indigo-500";
                return (
                  <tr
                    key={row.member.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style={{ backgroundColor: getUserColor(i) }}
                        >
                          {getInitials(row.member.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{row.member.name}</p>
                          <p className="text-xs text-gray-400">{row.member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{roleBadge(row.member.role)}</td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(row.spend)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="text-xs">
                        <div>In: {formatTokens(row.inputTokens)}</div>
                        <div>Out: {formatTokens(row.outputTokens)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 min-w-[140px]">
                      <div className="flex items-center gap-2">
                        <Progress value={row.pct} colorClass={progressColor} className="flex-1" />
                        <span className="text-xs text-gray-500 w-10 shrink-0">
                          {row.pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {row.spendLimit > 0 ? formatCurrency(row.spendLimit) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50/80 border-t border-gray-200">
                  <td className="px-6 py-3 font-semibold text-gray-700">Total</td>
                  <td />
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {formatCurrency(sorted.reduce((s, r) => s + r.spend, 0))}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatTokens(sorted.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0))} total
                  </td>
                  <td />
                  <td className="px-6 py-3 text-right text-gray-500">
                    {formatCurrency(totalBudget)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
