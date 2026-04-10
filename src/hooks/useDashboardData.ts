"use client";

import { useState, useEffect, useCallback } from "react";
import { startOfMonth, endOfMonth } from "@/lib/utils";

export interface DayUsage {
  date: string;
  cost: number;
  input_tokens: number;
  output_tokens: number;
}

export interface ModelUsage {
  model: string;
  cost: number;
  input_tokens: number;
  output_tokens: number;
}

export interface ApiKeyUsage {
  api_key_id: string;
  cost: number;
  input_tokens: number;
  output_tokens: number;
}

export interface UsageSummary {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  recordCount: number;
}

export interface UsageData {
  summary: UsageSummary;
  byDay: DayUsage[];
  byModel: ModelUsage[];
  byApiKey: ApiKeyUsage[];
  raw: unknown[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface MembersData {
  members: Member[];
  workspaces: { id: string; name: string }[];
}

export type DateRange = "mtd" | "last30" | "last7";

export function useDashboardData(adminKey: string) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [members, setMembers] = useState<MembersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("mtd");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const getDateParams = useCallback(() => {
    const now = new Date();
    if (dateRange === "mtd") {
      return { start_time: startOfMonth(now), end_time: endOfMonth(now) };
    }
    if (dateRange === "last7") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { start_time: d.toISOString(), end_time: now.toISOString() };
    }
    // last30
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    return { start_time: d.toISOString(), end_time: now.toISOString() };
  }, [dateRange]);

  const refresh = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError(null);

    const { start_time, end_time } = getDateParams();

    const headers = { "x-admin-key": adminKey };
    const usageParams = new URLSearchParams({ start_time, end_time });

    try {
      const [usageRes, membersRes] = await Promise.all([
        fetch(`/api/usage?${usageParams}`, { headers }),
        fetch("/api/members", { headers }),
      ]);

      if (!usageRes.ok) {
        const e = await usageRes.json();
        throw new Error(e.error ?? "Failed to fetch usage");
      }
      if (!membersRes.ok) {
        const e = await membersRes.json();
        throw new Error(e.error ?? "Failed to fetch members");
      }

      const [usageData, membersData] = await Promise.all([usageRes.json(), membersRes.json()]);
      setUsage(usageData);
      setMembers(membersData);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [adminKey, getDateParams]);

  useEffect(() => {
    if (adminKey) refresh();
  }, [adminKey, dateRange, refresh]);

  return { usage, members, loading, error, refresh, dateRange, setDateRange, lastRefresh };
}
