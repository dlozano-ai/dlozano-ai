"use client";

import { RefreshCw, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DateRange } from "@/hooks/useDashboardData";

interface HeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  onSettings: () => void;
  loading: boolean;
  lastRefresh: Date | null;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DATE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "mtd", label: "Month to Date" },
  { value: "last30", label: "Last 30 Days" },
  { value: "last7", label: "Last 7 Days" },
];

export function Header({
  onRefresh,
  onLogout,
  onSettings,
  loading,
  lastRefresh,
  dateRange,
  onDateRangeChange,
}: HeaderProps) {
  const label = DATE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "Month to Date";

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Org Usage Dashboard</h1>
              <p className="text-xs text-gray-400">Claude · Anthropic</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Date range selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {DATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {lastRefresh && (
              <span className="hidden sm:block text-xs text-gray-400">
                Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}

            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onSettings}>
              <Settings className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
