"use client";

import { useState } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useAdminKey } from "@/hooks/useAdminKey";
import { useConfig } from "@/hooks/useConfig";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ApiKeySetup } from "@/components/dashboard/ApiKeySetup";
import { Header } from "@/components/dashboard/Header";
import { SpendOverview } from "@/components/dashboard/SpendOverview";
import { InsightCards } from "@/components/dashboard/InsightCards";
import { UserTable } from "@/components/dashboard/UserTable";
import { DailySpendChart, ModelBreakdownChart, SpendPieChart } from "@/components/dashboard/UsageChart";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { adminKey, setAdminKey, isLoaded } = useAdminKey();
  const { config, setConfig, isLoaded: configLoaded } = useConfig();
  const [showSettings, setShowSettings] = useState(false);
  const { usage, members, loading, error, refresh, dateRange, setDateRange, lastRefresh } =
    useDashboardData(adminKey);

  if (!isLoaded || !configLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!adminKey || showSettings) {
    return (
      <ApiKeySetup
        currentKey={adminKey}
        currentMonthlyLimit={config.monthlyLimit}
        onCancel={adminKey ? () => setShowSettings(false) : undefined}
        onSave={(key, monthlyLimit) => {
          setAdminKey(key);
          setConfig({ monthlyLimit });
          setShowSettings(false);
        }}
      />
    );
  }

  const dateLabel = (() => {
    const now = new Date();
    if (dateRange === "mtd") {
      return `Month to date · Resets ${new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`;
    }
    if (dateRange === "last7") return "Last 7 days";
    return "Last 30 days";
  })();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onRefresh={refresh}
        onLogout={() => { setAdminKey(""); }}
        onSettings={() => setShowSettings(true)}
        loading={loading}
        lastRefresh={lastRefresh}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-red-800">Failed to load data</p>
              <p className="text-sm text-red-600 mt-0.5 break-all">{error}</p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={refresh}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowSettings(true)}>
                  Change API Key
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && !usage && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <p className="text-gray-500">Loading organization usage data...</p>
          </div>
        )}

        {/* Dashboard content */}
        {usage && members && (
          <>
            {/* Section: Spend overview */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Usage &amp; Spend Limits
              </h2>
              <SpendOverview usage={usage} spendLimit={config.monthlyLimit} dateLabel={dateLabel} />
            </section>

            {/* Section: Insights */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Key Insights
              </h2>
              <InsightCards usage={usage} members={members.members} />
            </section>

            {/* Section: Charts */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Usage Trends
              </h2>
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
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Spend by Member
              </h2>
              <UserTable
                members={members.members}
                apiKeyUsage={usage.byApiKey}
                totalBudget={config.monthlyLimit}
              />
            </section>
          </>
        )}

        {/* Empty state - has key but no data */}
        {!loading && !error && usage && usage.summary.recordCount === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <p className="text-gray-500 text-lg font-medium">No usage data found</p>
            <p className="text-gray-400 text-sm mt-2">
              No API calls were made in the selected period.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
