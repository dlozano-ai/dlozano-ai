"use client";

import { RefreshCw, Settings, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KWLogo } from "@/components/ui/KWLogo";
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
  return (
    <header className="sticky top-0 z-20 border-b border-[color:var(--kw-border)] bg-white/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <KWLogo variant="mark" className="h-11 w-11 text-base shrink-0" />
            <div className="min-w-0">
              <div className="flex items-baseline gap-1">
                <KWLogo className="text-[17px]" />
              </div>
              <p className="text-xs text-[color:var(--kw-text-muted)] font-medium">
                Organization Usage
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Date range selector — pill-shaped per brand */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
                className="appearance-none pl-5 pr-10 h-11 text-sm font-medium bg-white border border-[color:var(--kw-border-strong)] rounded-full text-[color:var(--kw-green-dark)] hover:border-[color:var(--kw-green)] focus:outline-none focus:ring-2 focus:ring-[color:var(--kw-green)]/20 cursor-pointer transition-colors"
              >
                {DATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[color:var(--kw-green)] pointer-events-none" />
            </div>

            {lastRefresh && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-[color:var(--kw-text-muted)] px-2">
                <span className="kw-dot h-1.5 w-1.5 text-[color:var(--kw-mint-dark)]" />
                {lastRefresh.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}

            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={onSettings} aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
