"use client";

import { useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAdminKey } from "@/hooks/useAdminKey";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ApiKeySetup } from "@/components/dashboard/ApiKeySetup";
import { Header } from "@/components/dashboard/Header";
import { SpendOverview } from "@/components/dashboard/SpendOverview";
import { InsightCards } from "@/components/dashboard/InsightCards";
import { UserTable } from "@/components/dashboard/UserTable";
import {
  DailySpendChart,
  ModelBreakdownChart,
  SpendPieChart,
} from "@/components/dashboard/UsageChart";
import { Button } from "@/components/ui/button";

const MONTHLY_LIMIT = 2000;

export default function DashboardPage() {
  const { adminKey, setAdminKey, isLoaded } = useAdminKey();
  const [showSettings, setShowSettings] = useState(false);
  const { usage, members, loading, error, refresh, dateRange, setDateRange, lastRefresh } =
    useDashboardData(adminKey);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[color:var(--kw-bg)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[color:var(--kw-green)] animate-spin" />
      </div>
    );
  }

  if (!adminKey || showSettings) {
    return (
      <ApiKeySetup
        currentKey={adminKey}
        onSave={(key) => {
          setAdminKey(key);
          setShowSettings(false);
        }}
      />
    );
  }

  const dateLabel = (() => {
    const now = new Date();
    if (dateRange === "mtd") {
      return `Month to date · Resets ${new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      ).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
    }
    if (dateRange === "last7") return "Last 7 days";
    return "Last 30 days";
  })();

  return (
    <div className="min-h-screen bg-[color:var(--kw-bg)]">
      <Header
        onRefresh={refresh}
        onLogout={() => setAdminKey("")}
        onSettings={() => setShowSettings(true)}
        loading={loading}
        lastRefresh={lastRefresh}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Error state */}
        {error && (
          <div className="rounded-[28px] border border-[color:var(--kw-coral)]/20 bg-[color:var(--kw-coral)]/5 p-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[color:var(--kw-coral)] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-[color:var(--kw-coral)]">
                Couldn&apos;t load your data
              </p>
              <p className="text-sm text-[color:var(--kw-text-muted)] mt-1 break-all">
                {error}
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={refresh}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                >
                  Change API Key
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && !usage && (
          <div className="rounded-[28px] border border-[color:var(--kw-border)] bg-white p-16 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-[color:var(--kw-green)] animate-spin" />
            <p className="text-[color:var(--kw-text-muted)] font-medium">
              Loading organization usage data…
            </p>
          </div>
        )}

        {/* Dashboard content */}
        {usage && members && (
          <>
            {/* Hero spend card (already has its own section header) */}
            <SpendOverview
              usage={usage}
              spendLimit={MONTHLY_LIMIT}
              dateLabel={dateLabel}
            />

            {/* Section: Insights */}
            <section>
              <SectionHeader
                eyebrow="Key Insights"
                title="What's worth knowing"
                serifEmphasis="knowing"
              />
              <InsightCards usage={usage} members={members.members} />
            </section>

            {/* Section: Charts */}
            <section>
              <SectionHeader
                eyebrow="Usage Trends"
                title="How spend is flowing"
                serifEmphasis="flowing"
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <DailySpendChart usage={usage} />
                </div>
                <SpendPieChart usage={usage} />
              </div>
              <div className="mt-4">
                <ModelBreakdownChart usage={usage} />
              </div>
            </section>

            {/* Section: User table */}
            <section>
              <SectionHeader
                eyebrow="By Member"
                title="Who's using what"
                serifEmphasis="who's"
              />
              <UserTable
                members={members.members}
                apiKeyUsage={usage.byApiKey}
                totalBudget={MONTHLY_LIMIT}
              />
            </section>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && usage && usage.summary.recordCount === 0 && (
          <div className="rounded-[28px] border border-[color:var(--kw-border)] bg-white p-16 text-center">
            <p className="font-heading font-bold text-xl text-[color:var(--kw-green-dark)]">
              No usage yet
            </p>
            <p className="text-[color:var(--kw-text-muted)] text-sm mt-2">
              No API calls were made in the selected period.
            </p>
          </div>
        )}

        <footer className="pt-6 pb-2 text-center text-xs text-[color:var(--kw-text-faint)]">
          Being Kind Works.
        </footer>
      </main>
    </div>
  );
}

/**
 * Section header with KindWorks eyebrow + Jeko Bold + Tiempos serif emphasis on one word.
 * Matches the brand pattern described in the design guide.
 */
function SectionHeader({
  eyebrow,
  title,
  serifEmphasis,
}: {
  eyebrow: string;
  title: string;
  serifEmphasis?: string;
}) {
  const parts = serifEmphasis
    ? title.split(new RegExp(`(${serifEmphasis})`, "i"))
    : [title];
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--kw-green)] mb-1">
        {eyebrow}
      </p>
      <h2 className="font-heading font-bold text-2xl sm:text-[26px] tracking-tight text-[color:var(--kw-green-dark)]">
        {parts.map((p, i) =>
          serifEmphasis && p.toLowerCase() === serifEmphasis.toLowerCase() ? (
            <em
              key={i}
              className="font-serif font-normal italic not-italic-fallback"
              style={{ fontStyle: "italic", color: "var(--kw-green)" }}
            >
              {p}
            </em>
          ) : (
            <span key={i}>{p}</span>
          )
        )}
      </h2>
    </div>
  );
}
