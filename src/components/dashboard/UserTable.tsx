"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

  // In production, exact mapping comes via API keys; for now, fan out per-member
  const rows: UserRow[] = members.map((m, i) => {
    const usage =
      apiKeyUsage[i] ?? { cost: 0, input_tokens: 0, output_tokens: 0, api_key_id: m.id };
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
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "desc" ? (
        <ChevronDown className="h-3.5 w-3.5" />
      ) : (
        <ChevronUp className="h-3.5 w-3.5" />
      )
    ) : (
      <ChevronDown className="h-3.5 w-3.5 opacity-25" />
    );

  const roleBadge = (role: string) => {
    const v: Record<string, "yellow" | "green" | "mint" | "muted"> = {
      admin: "yellow",
      developer: "green",
      billing: "mint",
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
              {members.length} {members.length === 1 ? "member" : "members"} · per-person usage
              breakdown
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--kw-text-muted)]" />
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-[color:var(--kw-border)] bg-[color:var(--kw-green)]/[0.03]">
                <th className="px-7 py-3.5 text-left">
                  <button
                    className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)] hover:text-[color:var(--kw-green-dark)] transition-colors"
                    onClick={() => toggleSort("name")}
                  >
                    Member <SortIcon col="name" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)]">
                  Role
                </th>
                <th className="px-4 py-3.5 text-left">
                  <button
                    className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)] hover:text-[color:var(--kw-green-dark)] transition-colors"
                    onClick={() => toggleSort("spend")}
                  >
                    MTD Spend <SortIcon col="spend" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-left font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)]">
                  Tokens
                </th>
                <th className="px-4 py-3.5 text-left">
                  <button
                    className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)] hover:text-[color:var(--kw-green-dark)] transition-colors"
                    onClick={() => toggleSort("pct")}
                  >
                    Budget Used <SortIcon col="pct" />
                  </button>
                </th>
                <th className="px-7 py-3.5 text-right font-semibold uppercase tracking-wider text-xs text-[color:var(--kw-text-muted)]">
                  Limit
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-7 py-16 text-center text-[color:var(--kw-text-muted)]"
                  >
                    No members found
                  </td>
                </tr>
              )}
              {sorted.map((row, i) => {
                const tone: "coral" | "yellow" | "green" =
                  row.pct >= 90 ? "coral" : row.pct >= 70 ? "yellow" : "green";
                return (
                  <tr
                    key={row.member.id}
                    className="border-b border-[color:var(--kw-border)] last:border-b-0 hover:bg-[color:var(--kw-green)]/[0.03] transition-colors"
                  >
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-heading font-bold shrink-0 shadow-[0_1px_0_rgba(27,66,57,0.08)]"
                          style={{ backgroundColor: getUserColor(i) }}
                        >
                          {getInitials(row.member.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[color:var(--kw-green-dark)] truncate">
                            {row.member.name}
                          </p>
                          <p className="text-xs text-[color:var(--kw-text-muted)] truncate">
                            {row.member.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">{roleBadge(row.member.role)}</td>
                    <td className="px-4 py-5">
                      <span className="font-heading font-bold text-[color:var(--kw-green-dark)] text-base">
                        {formatCurrency(row.spend)}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-[color:var(--kw-text-muted)]">
                      <div className="text-xs leading-relaxed">
                        <div>
                          <span className="text-[color:var(--kw-text-faint)]">In</span>{" "}
                          {formatTokens(row.inputTokens)}
                        </div>
                        <div>
                          <span className="text-[color:var(--kw-text-faint)]">Out</span>{" "}
                          {formatTokens(row.outputTokens)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <Progress value={row.pct} tone={tone} className="flex-1" />
                        <span className="text-xs font-semibold text-[color:var(--kw-green-dark)] w-10 shrink-0 text-right">
                          {row.pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-7 py-5 text-right text-[color:var(--kw-text-muted)] font-medium">
                      {row.spendLimit > 0 ? formatCurrency(row.spendLimit) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr className="bg-[color:var(--kw-green)]/[0.04] border-t-2 border-[color:var(--kw-green)]/15">
                  <td className="px-7 py-4 font-heading font-bold text-[color:var(--kw-green-dark)]">
                    Total
                  </td>
                  <td />
                  <td className="px-4 py-4 font-heading font-bold text-[color:var(--kw-green-dark)] text-base">
                    {formatCurrency(sorted.reduce((s, r) => s + r.spend, 0))}
                  </td>
                  <td className="px-4 py-4 text-xs text-[color:var(--kw-text-muted)]">
                    {formatTokens(
                      sorted.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0)
                    )}{" "}
                    total
                  </td>
                  <td />
                  <td className="px-7 py-4 text-right font-medium text-[color:var(--kw-green-dark)]">
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
