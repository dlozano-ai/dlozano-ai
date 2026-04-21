# KindWorks Usage Dashboard — Full Project Handoff

> Paste this file into a new Claude Code session and say:
> **"Build this app from scratch following the spec in project-handoff.md"**

---

## Part 1 — Project Goals & Tech Stack

### What This Is
A KindWorks.AI-branded dashboard that monitors Claude API usage and spend across every member of your Anthropic organization. Available as:
- A **web app** (`npm run dev` → localhost:3000)
- A **native macOS .dmg installer** built with Electron

### Core Features
1. **API Key Setup screen** — validates `sk-ant-admin-*` key, stores in localStorage
2. **Spend Overview** — MTD spend vs $2,000 limit, progress bar (mint→yellow→coral), 4 stat cards
3. **Key Insights** — Top model, top spender, avg daily spend, projected monthly
4. **Usage Trends** — Daily area chart, model bar chart, model pie chart (Recharts)
5. **Member Table** — per-user spend, tokens, budget %, role badges; sortable, searchable
6. **Date Range** — Month to Date / Last 30 Days / Last 7 Days (header dropdown)

### Tech Stack (exact versions)
```json
{
  "next": "16.2.3",
  "react": "19.2.4",
  "react-dom": "19.2.4",
  "recharts": "^3.8.1",
  "lucide-react": "^1.8.0",
  "tailwindcss": "^4",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "date-fns": "^4.1.0",
  "electron": "^41.2.0",
  "electron-builder": "^26.8.1",
  "concurrently": "^9.2.1",
  "wait-on": "^9.0.5",
  "@types/node": "^20",
  "typescript": "^5"
}
```

### `package.json` (complete)
```json
{
  "name": "kindworks-usage-dashboard",
  "productName": "KindWorks Usage",
  "version": "0.1.0",
  "description": "KindWorks.AI organization usage dashboard for Claude",
  "author": { "name": "KindWorks.AI", "email": "hello@kindworks.ai" },
  "main": "electron/main.js",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "prepare:electron": "node scripts/prepare-electron.js",
    "build:icon": "node scripts/build-icon.js",
    "build:electron": "next build && npm run prepare:electron",
    "electron:dev": "concurrently -k -n next,electron -c blue,green \"next dev\" \"wait-on http://127.0.0.1:3000 && NEXT_DEV_URL=http://127.0.0.1:3000 electron .\"",
    "electron:preview": "npm run build:electron && electron .",
    "pack:mac": "npm run build:electron && electron-builder --mac --arm64",
    "pack:mac-arm64": "npm run build:electron && electron-builder --mac --arm64",
    "pack:mac-x64": "npm run build:electron && electron-builder --mac --x64",
    "pack:mac-universal": "npm run build:electron && electron-builder --mac --universal"
  },
  "build": {
    "appId": "ai.kindworks.usage-dashboard",
    "productName": "KindWorks Usage",
    "copyright": "Copyright © 2026 KindWorks.AI",
    "directories": { "output": "dist-electron", "buildResources": "build" },
    "files": ["electron/**/*", "!**/*.ts", "!**/*.map"],
    "extraResources": [{ "from": "app-dist", "to": "app-dist", "filter": ["**/*"] }],
    "mac": {
      "category": "public.app-category.business",
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "darkModeSupport": false,
      "hardenedRuntime": false,
      "gatekeeperAssess": false,
      "identity": null
    },
    "dmg": {
      "title": "KindWorks Usage",
      "backgroundColor": "#2E6661",
      "window": { "width": 540, "height": 380 },
      "contents": [
        { "x": 140, "y": 190, "type": "file" },
        { "x": 400, "y": 190, "type": "link", "path": "/Applications" }
      ]
    }
  }
}
```

### `next.config.ts`
```ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingExcludes: {
    "/*": ["node_modules/@img/**", "node_modules/sharp/**"],
  },
};

export default nextConfig;
```

### `tsconfig.json`
Standard Next.js tsconfig with `"paths": { "@/*": ["./src/*"] }`.

### `.gitignore` additions
```
/node_modules
/.next/
/out/
/app-dist/
/dist-electron/
/build/icon.png
/build/icon-*.png
/build/icon.icns
.DS_Store
.env*
*.tsbuildinfo
next-env.d.ts
```

### `.claude/settings.json`
```json
{ "permissions": { "defaultMode": "bypassPermissions" } }
```

---

## Part 2 — Brand System

### KindWorks.AI Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--kw-coral` | `#FF474A` | Danger, alert, bold statements |
| `--kw-coral-light` | `#FF8484` | Hover state for coral |
| `--kw-green` | `#2E6661` | Primary brand, data |
| `--kw-green-dark` | `#1B4239` | Hero backgrounds, headings |
| `--kw-yellow` | `#FFB500` | Accent, CTA, warmth, celebrations |
| `--kw-yellow-light` | `#FFD166` | Hover state for yellow |
| `--kw-purple` | `#9C338C` | Inspiration, projected/forecast |
| `--kw-purple-dark` | `#6F0E60` | |
| `--kw-mint` | `#8FE0BF` | Success, soft data, research |
| `--kw-mint-dark` | `#4DAE97` | |
| `--kw-bg` | `#FAFAF7` | Page background |
| `--kw-text` | `#1B4239` | Body text |
| `--kw-text-muted` | `rgba(27,66,57,0.62)` | Secondary text |
| `--kw-text-faint` | `rgba(27,66,57,0.42)` | Tertiary text |
| `--kw-border` | `rgba(30,30,30,0.08)` | Card borders |
| `--kw-border-strong` | `rgba(30,30,30,0.16)` | Input borders |

### Typography
- **Headings:** "Jeko" → fallback "Inter" (font-heading)
- **Body:** "DM Sans" (font-body)
- **Serif italic emphasis:** "Source Serif 4" italic (font-serif) — used for one word in section titles
- Load via Google Fonts `<link>` in `layout.tsx` (NOT `next/font` — causes network errors in Electron)

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:ital,wght@1,300;1,400&display=swap" rel="stylesheet" />
```

### Radii
- `--kw-radius-sm: 12px`, `--kw-radius-md: 20px`, `--kw-radius-lg: 28px`, `--kw-radius-xl: 36px`, `--kw-radius-pill: 9999px`
- Cards: `rounded-[28px]`, Buttons: `rounded-full`, Inputs: `rounded-full`

### Signature Patterns
```css
/* .kw-grid — dark green background with subtle white grid lines */
.kw-grid {
  background-color: var(--kw-green);
  background-image:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 40px 40px;
}
/* .kw-dot — floating yellow dots (brand accent) */
.kw-dot { display: inline-block; border-radius: 9999px; background-color: currentColor; }
```

### Tailwind v4 Theme (`@theme inline` in globals.css)
```css
@import "tailwindcss";
@theme inline {
  --color-kw-coral: var(--kw-coral);
  --color-kw-green: var(--kw-green);
  --color-kw-green-dark: var(--kw-green-dark);
  --color-kw-yellow: var(--kw-yellow);
  --color-kw-purple: var(--kw-purple);
  --color-kw-mint: var(--kw-mint);
  --color-kw-mint-dark: var(--kw-mint-dark);
  --color-kw-bg: var(--kw-bg);
  --color-kw-text: var(--kw-text);
  --color-kw-text-muted: var(--kw-text-muted);
  --font-sans: var(--kw-font-body);
  --font-heading: var(--kw-font-heading);
  --font-serif: var(--kw-font-serif);
}
body { background: var(--kw-bg); color: var(--kw-text); font-family: var(--kw-font-body); }
h1,h2,h3,h4,h5,h6 { font-family: var(--kw-font-heading); letter-spacing: -0.01em; }
```

### Chart Colors (in order)
```ts
export const KW_CHART_COLORS = [
  "#2E6661", "#FFB500", "#FF474A", "#9C338C",
  "#8FE0BF", "#1B4239", "#4DAE97", "#FFD166", "#FF8484", "#6F0E60",
];
```

---

## Part 3 — Anthropic Admin API

### Auth
- Header: `x-api-key: sk-ant-admin-...`
- Header: `anthropic-version: 2023-06-01`
- Base URL: `https://api.anthropic.com/v1`
- Key obtained from: console.anthropic.com/settings/admin-keys

### Endpoints Used
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/organizations/members` | GET | List all org members (paginated) |
| `/workspaces` | GET | List all workspaces (paginated) |
| `/usage` | GET | Usage records filtered by start_time/end_time |

### Pagination Pattern
All list endpoints use cursor-based pagination with `after_id`. Fetch all pages:
```ts
async fetchAll<T>(path, params): Promise<T[]> {
  const all = [];
  let afterId;
  while (true) {
    const p = { limit: "100", ...params, ...(afterId ? { after_id: afterId } : {}) };
    const page = await this.fetch(path, p); // GET with query params
    all.push(...page.data);
    if (!page.has_more || !page.last_id) break;
    afterId = page.last_id;
  }
  return all;
}
```

### UsageRecord Shape
```ts
interface UsageRecord {
  timestamp: string;        // ISO date
  organization_id: string;
  workspace_id: string | null;
  api_key_id: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}
```

### Model Pricing (per million tokens, USD)
```ts
const MODEL_PRICING = {
  "claude-opus-4-5":           { input: 15,   output: 75,   cacheWrite: 18.75, cacheRead: 1.5  },
  "claude-sonnet-4-5":         { input: 3,    output: 15,   cacheWrite: 3.75,  cacheRead: 0.3  },
  "claude-haiku-4-5":          { input: 0.8,  output: 4,    cacheWrite: 1,     cacheRead: 0.08 },
  "claude-3-5-sonnet-20241022":{ input: 3,    output: 15,   cacheWrite: 3.75,  cacheRead: 0.3  },
  "claude-3-5-haiku-20241022": { input: 0.8,  output: 4,    cacheWrite: 1,     cacheRead: 0.08 },
  "claude-3-opus-20240229":    { input: 15,   output: 75,   cacheWrite: 18.75, cacheRead: 1.5  },
  "claude-3-haiku-20240307":   { input: 0.25, output: 1.25, cacheWrite: 0.3,   cacheRead: 0.03 },
};
// calculateCost: try exact match → prefix match → default to Sonnet pricing
```

### Key Architecture Decision
The admin key is **never exposed to the browser**. Flow:
1. Browser stores key in localStorage
2. Browser sends key as `x-admin-key` header to **Next.js API routes** (`/api/usage`, `/api/members`, `/api/validate-key`)
3. Next.js API routes forward to `api.anthropic.com` server-side

---

## Part 4 — File Structure & Implementation

### Directory Layout
```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Font loading, metadata
│   │   ├── page.tsx                # Main dashboard ("use client")
│   │   ├── globals.css             # Brand tokens + Tailwind
│   │   └── api/
│   │       ├── usage/route.ts      # GET /api/usage
│   │       ├── members/route.ts    # GET /api/members
│   │       └── validate-key/route.ts # POST /api/validate-key
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ApiKeySetup.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SpendOverview.tsx
│   │   │   ├── InsightCards.tsx
│   │   │   ├── UsageChart.tsx
│   │   │   └── UserTable.tsx
│   │   └── ui/
│   │       ├── KWLogo.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── progress.tsx
│   │       └── input.tsx
│   ├── hooks/
│   │   ├── useAdminKey.ts
│   │   └── useDashboardData.ts
│   └── lib/
│       ├── anthropic-admin.ts
│       └── utils.ts
├── electron/
│   └── main.js
├── scripts/
│   ├── prepare-electron.js
│   └── build-icon.js
├── build/
│   └── icon.svg
├── public/              # (empty or favicons)
├── next.config.ts
├── package.json
├── tsconfig.json
└── .claude/settings.json
```

---

## Part 5 — Source Code: Lib + Hooks + API Routes

### `src/lib/utils.ts`
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD",
    minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens/1e9).toFixed(1)}B`;
  if (tokens >= 1_000_000) return `${(tokens/1e6).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens/1e3).toFixed(1)}K`;
  return tokens.toString();
}

export function getModelDisplayName(modelId: string): string {
  const map: Record<string,string> = {
    "claude-opus-4-5": "Claude Opus 4.5", "claude-sonnet-4-5": "Claude Sonnet 4.5",
    "claude-haiku-4-5": "Claude Haiku 4.5", "claude-opus-4-0": "Claude Opus 4",
    "claude-sonnet-4-0": "Claude Sonnet 4",
    "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
    "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
    "claude-3-opus-20240229": "Claude 3 Opus",
    "claude-3-haiku-20240307": "Claude 3 Haiku",
  };
  return map[modelId] ?? modelId;
}

export function getModelFamily(modelId: string): string {
  if (modelId.includes("opus")) return "Opus";
  if (modelId.includes("sonnet")) return "Sonnet";
  if (modelId.includes("haiku")) return "Haiku";
  return "Other";
}

export function startOfMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
}
export function endOfMonth(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth()+1, 0, 23, 59, 59).toISOString();
}
export function getDayLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
}

export const KW_CHART_COLORS = [
  "#2E6661","#FFB500","#FF474A","#9C338C","#8FE0BF",
  "#1B4239","#4DAE97","#FFD166","#FF8484","#6F0E60",
] as const;

export function getUserColor(index: number): string {
  return KW_CHART_COLORS[index % KW_CHART_COLORS.length];
}
```

### `src/hooks/useAdminKey.ts`
```ts
"use client";
import { useState, useEffect, useCallback } from "react";
const STORAGE_KEY = "anthropic_admin_key";

export function useAdminKey() {
  const [adminKey, setAdminKeyState] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setAdminKeyState(localStorage.getItem(STORAGE_KEY) ?? "");
    setIsLoaded(true);
  }, []);

  const setAdminKey = useCallback((key: string) => {
    setAdminKeyState(key);
    if (key) localStorage.setItem(STORAGE_KEY, key);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { adminKey, setAdminKey, isLoaded, hasKey: Boolean(adminKey) };
}
```

### `src/hooks/useDashboardData.ts`
```ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { startOfMonth, endOfMonth } from "@/lib/utils";

export type DateRange = "mtd" | "last30" | "last7";

export interface UsageData {
  summary: { totalCost: number; totalInputTokens: number; totalOutputTokens: number; recordCount: number; };
  byDay: { date: string; cost: number; input_tokens: number; output_tokens: number; }[];
  byModel: { model: string; cost: number; input_tokens: number; output_tokens: number; }[];
  byApiKey: { api_key_id: string; cost: number; input_tokens: number; output_tokens: number; }[];
  raw: unknown[];
}
export interface Member { id: string; name: string; email: string; role: string; }
export interface ApiKeyUsage { api_key_id: string; cost: number; input_tokens: number; output_tokens: number; }
export interface MembersData { members: Member[]; workspaces: { id: string; name: string; }[]; }

export function useDashboardData(adminKey: string) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [members, setMembers] = useState<MembersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("mtd");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const getDateParams = useCallback(() => {
    const now = new Date();
    if (dateRange === "mtd") return { start_time: startOfMonth(now), end_time: endOfMonth(now) };
    if (dateRange === "last7") {
      const d = new Date(now); d.setDate(d.getDate()-7);
      return { start_time: d.toISOString(), end_time: now.toISOString() };
    }
    const d = new Date(now); d.setDate(d.getDate()-30);
    return { start_time: d.toISOString(), end_time: now.toISOString() };
  }, [dateRange]);

  const refresh = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true); setError(null);
    const { start_time, end_time } = getDateParams();
    const headers = { "x-admin-key": adminKey };
    try {
      const [usageRes, membersRes] = await Promise.all([
        fetch(`/api/usage?${new URLSearchParams({ start_time, end_time })}`, { headers }),
        fetch("/api/members", { headers }),
      ]);
      if (!usageRes.ok) throw new Error((await usageRes.json()).error ?? "Failed to fetch usage");
      if (!membersRes.ok) throw new Error((await membersRes.json()).error ?? "Failed to fetch members");
      const [u, m] = await Promise.all([usageRes.json(), membersRes.json()]);
      setUsage(u); setMembers(m); setLastRefresh(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally { setLoading(false); }
  }, [adminKey, getDateParams]);

  useEffect(() => { if (adminKey) refresh(); }, [adminKey, dateRange, refresh]);

  return { usage, members, loading, error, refresh, dateRange, setDateRange, lastRefresh };
}
```

### `src/app/api/usage/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, calculateCost } from "@/lib/anthropic-admin";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!adminKey) return NextResponse.json({ error: "Missing admin API key" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const startTime = searchParams.get("start_time") ?? undefined;
  const endTime = searchParams.get("end_time") ?? undefined;

  try {
    const client = createAdminClient(adminKey);
    const records = await client.getUsage({ start_time: startTime, end_time: endTime });

    const byDay: Record<string, any> = {};
    const byModel: Record<string, any> = {};
    const byApiKey: Record<string, any> = {};
    let totalCost = 0, totalInputTokens = 0, totalOutputTokens = 0;

    for (const r of records) {
      const cost = calculateCost(r);
      totalCost += cost; totalInputTokens += r.input_tokens; totalOutputTokens += r.output_tokens;

      const day = r.timestamp.slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, cost: 0, input_tokens: 0, output_tokens: 0 };
      byDay[day].cost += cost; byDay[day].input_tokens += r.input_tokens; byDay[day].output_tokens += r.output_tokens;

      if (!byModel[r.model]) byModel[r.model] = { model: r.model, cost: 0, input_tokens: 0, output_tokens: 0 };
      byModel[r.model].cost += cost; byModel[r.model].input_tokens += r.input_tokens; byModel[r.model].output_tokens += r.output_tokens;

      const keyId = r.api_key_id ?? "unknown";
      if (!byApiKey[keyId]) byApiKey[keyId] = { api_key_id: keyId, cost: 0, input_tokens: 0, output_tokens: 0 };
      byApiKey[keyId].cost += cost; byApiKey[keyId].input_tokens += r.input_tokens; byApiKey[keyId].output_tokens += r.output_tokens;
    }

    return NextResponse.json({
      summary: { totalCost, totalInputTokens, totalOutputTokens, recordCount: records.length },
      byDay: Object.values(byDay).sort((a: any, b: any) => a.date.localeCompare(b.date)),
      byModel: Object.values(byModel).sort((a: any, b: any) => b.cost - a.cost),
      byApiKey: Object.values(byApiKey).sort((a: any, b: any) => b.cost - a.cost),
      raw: records,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: msg.includes("401") ? 401 : 500 });
  }
}
```

### `src/app/api/members/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/anthropic-admin";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!adminKey) return NextResponse.json({ error: "Missing admin API key" }, { status: 401 });
  try {
    const client = createAdminClient(adminKey);
    const [members, workspaces] = await Promise.all([client.getMembers(), client.getWorkspaces()]);
    return NextResponse.json({ members, workspaces });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

### `src/app/api/validate-key/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { adminKey } = await req.json().catch(() => ({}));
  if (!adminKey) return NextResponse.json({ valid: false, error: "No key provided" }, { status: 400 });
  try {
    const res = await fetch("https://api.anthropic.com/v1/organizations/members?limit=1", {
      headers: { "x-api-key": adminKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    });
    if (res.ok) return NextResponse.json({ valid: true });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({ valid: false, error: body?.error?.message ?? `HTTP ${res.status}` });
  } catch (e: unknown) {
    return NextResponse.json({ valid: false, error: e instanceof Error ? e.message : "Unknown error" });
  }
}
```

---

## Part 6 — UI Components

### `src/components/ui/KWLogo.tsx`
Two variants: `full` (wordmark "KindWorks" + coral ".AI" superscript) and `mark` (pill with yellow K).
```tsx
export function KWLogo({ variant = "full", color = "green", className }) {
  const fg = { green: "var(--kw-green)", white: "#fff", coral: "var(--kw-coral)", black: "var(--kw-black)" }[color];
  if (variant === "mark") {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-full font-heading font-bold leading-none select-none", className)}
        style={{ backgroundColor: fg, color: "var(--kw-yellow)" }} aria-label="KindWorks.AI">
        <span className="relative">K
          <span className="absolute -top-1 -right-2 text-[0.4em] font-bold" style={{ color: "var(--kw-yellow)" }}>·AI</span>
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-baseline font-heading font-bold leading-none tracking-tight select-none", className)}
      style={{ color: fg }} aria-label="KindWorks.AI">
      <span className="relative">KindWorks
        <span className="absolute left-full -top-0.5 ml-0.5 text-[0.5em] font-bold" style={{ color: "var(--kw-coral)" }}>.AI</span>
      </span>
    </span>
  );
}
```

### `src/components/ui/button.tsx`
Pill-shaped buttons. Variants: `primary` (yellow bg, green text), `secondary` (white, green border), `ghost`, `danger` (coral), `yellow`.
```tsx
const variantClasses = {
  primary: "bg-[color:var(--kw-yellow)] text-[color:var(--kw-green-dark)] hover:bg-[color:var(--kw-yellow-light)]",
  secondary: "bg-white text-[color:var(--kw-green-dark)] border border-[color:var(--kw-border-strong)] hover:border-[color:var(--kw-green)]",
  ghost: "text-[color:var(--kw-green-dark)] hover:bg-[color:var(--kw-green)]/8",
  danger: "bg-[color:var(--kw-coral)] text-white",
  yellow: "bg-[color:var(--kw-yellow)] text-[color:var(--kw-green-dark)]",
};
const sizeClasses = { sm: "h-9 px-4 text-sm", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-base" };
// All buttons: rounded-full, font-medium, transition-all, focus-visible ring in kw-green
```

### `src/components/ui/card.tsx`
28px border-radius, shadow, optional tone background.
```tsx
// toneClasses: default=white, green, green-dark, coral, yellow, purple, mint
export function Card({ tone = "default", className, ...props }) {
  return <div className={cn("rounded-[28px] border shadow-[0_1px_2px_rgba(27,66,57,0.04),0_12px_40px_-24px_rgba(27,66,57,0.16)]",
    toneClasses[tone], className)} {...props} />;
}
// Also export: CardHeader (p-7 pb-3), CardTitle (font-heading bold 17px), CardDescription, CardContent (p-7 pt-0), CardFooter
```

### `src/components/ui/progress.tsx`
```tsx
// tones: green → kw-green, yellow → kw-yellow, coral → kw-coral, mint → kw-mint-dark
// Track: h-2.5, bg-kw-green/10, rounded-full. Fill: transition 500ms, width = value%
```

### `src/components/ui/badge.tsx`
```tsx
// variants: green, mint, purple, yellow, coral, muted (all use ring-1 ring-inset, rounded-full, text-xs)
```

### `src/components/ui/input.tsx`
```tsx
// h-11, rounded-full, border kw-border-strong, focus ring kw-green/20, font-mono for key input
```

---

## Part 7 — Dashboard Components

### `src/components/dashboard/Header.tsx`
Sticky top bar, white/85 backdrop-blur. Left: KWLogo mark + wordmark + "Organization Usage". Right: date range `<select>` (rounded-full), last-refresh time with mint dot, Refresh/Settings/Logout ghost buttons.

### `src/components/dashboard/ApiKeySetup.tsx`
Full-screen landing. Top half: `kw-grid` dark-green hero with floating yellow/mint `.kw-dot` decorations, KWLogo mark, headline **"See how *Kindness* scales across your org."** (Kindness in Source Serif italic yellow). Bottom half: Card with password input (font-mono), validates via `POST /api/validate-key`, shows CheckCircle (mint) or XCircle (coral) inline, primary yellow "Connect to Organization" button. Below card: mint-tinted helper card with 4-step instructions.

### `src/components/dashboard/SpendOverview.tsx`
Hero card with `kw-grid` + floating yellow dots. Giant spend amount (text-5xl/6xl), percentage, progress bar color-shifts mint→yellow→coral at 70%/90%. Below: 4 stat cards (Total Spend/green, Budget Remaining/mint, Input Tokens/purple, Output Tokens/yellow).

### `src/components/dashboard/InsightCards.tsx`
4-up grid. Each card has a soft corner dot (brand accent), colored icon badge, UPPERCASE label, bold primary value, muted secondary. Cards:
1. **Top Model** (mint) — model name, cost, token count badge
2. **Top Spender** (yellow) — member name, cost, % of total badge  
3. **Avg Daily Spend** (green) — formatted currency, days count
4. **Projected Monthly** (purple/yellow/coral) — projected cost, "On track"/"Near limit"/"Over limit" badge

### `src/components/dashboard/UsageChart.tsx`
Three Recharts charts, all use `tooltipStyle` (white pill, green border, 16px radius):

**DailySpendChart** — AreaChart, green gradient fill (`kwCostGradient`), yellow active dot, `$N` Y-axis labels.

**ModelBreakdownChart** — Horizontal BarChart (layout="vertical"), each bar gets `getUserColor(i)`, rounded right edge `radius={[0,10,10,0]}`.

**SpendPieChart** — Donut (innerRadius=56, outerRadius=88), paddingAngle=3, Legend with circle icons.

### `src/components/dashboard/UserTable.tsx`
Card with search input (pill, Search icon). Table columns: Member (avatar initials circle colored by `getUserColor(i)`, name, email), Role (badge: admin=yellow, developer=green, billing=mint, readonly=muted), MTD Spend, Tokens (In/Out), Budget Used (Progress bar + %), Limit. Sortable on name/spend/pct. Footer row with totals.

### `src/app/layout.tsx`
```tsx
// Loads Google Fonts via <link> (not next/font — Electron can't fetch at build time)
// DM Sans + Inter + Source Serif 4 italic
// metadata: title "KindWorks.AI · Org Usage Dashboard"
```

### `src/app/page.tsx`
`"use client"`. Top-level state: adminKey (from hook), showSettings. Renders ApiKeySetup if no key. Otherwise: Header → main (max-w-7xl) → SpendOverview → SectionHeader+"InsightCards" → SectionHeader+"Charts (2/3 + 1/3 grid)" → ModelBreakdownChart → SectionHeader+"UserTable" → footer "Being Kind Works."

**SectionHeader component** (local, not exported):
```tsx
// eyebrow: small green uppercase tracking label
// title: Jeko bold, one word replaced with Source Serif italic in kw-green
// e.g. "What's worth knowing" → "knowing" becomes <em style={fontStyle:"italic", color:"var(--kw-green)"}>
```

`MONTHLY_LIMIT = 2000` (hardcoded, passed to SpendOverview and UserTable).

---

## Part 8 — Electron + Build Scripts

### `electron/main.js`
```js
// Key behaviors:
// 1. Opens window IMMEDIATELY with branded splash screen (data: URL HTML)
//    - Dark green (#1b4239) bg, grid pattern, yellow K mark, pulsing yellow dots
//    - show: true so window is visible from launch
// 2. Starts Next.js standalone server as child process (ELECTRON_RUN_AS_NODE=1)
//    - Checks fs.existsSync(serverPath) first, rejects with helpful error if missing
//    - Logs to module-level serverLog[] array (max 200 entries)
//    - Polls http://127.0.0.1:port/ every 250ms, 20s deadline
// 3. Once server responds, calls mainWindow.loadURL(targetUrl)
// 4. On failure: dialog.showErrorBox() with server log tail
// 5. NEXT_DEV_URL env var: skip server spawn, use existing dev server (for electron:dev script)
// 6. External links → shell.openExternal (never navigate inside Electron)
// 7. Menu: app/Edit/View(Refresh+DevTools+Zoom+Fullscreen)/Window
// 8. Cleans up server on window-all-closed, before-quit, will-quit

// resolveServerPath():
//   isDev → .next/standalone/server.js
//   packaged → process.resourcesPath/app-dist/server.js

// BrowserWindow config:
//   1440x900, min 960x640, titleBarStyle: "hiddenInset",
//   backgroundColor: "#1b4239" (matches splash), show: true
//   contextIsolation: true, nodeIntegration: false, sandbox: true
```

### `scripts/prepare-electron.js`
```
Copies:
  .next/standalone/  → app-dist/
  .next/static/      → app-dist/.next/static/
  public/            → app-dist/public/
Handles symlinks (readlinkSync → symlinkSync, fallback to copyFileSync).
Clears app-dist/ first with fs.rmSync recursive.
```

### `scripts/build-icon.js`
```
Uses sharp (transitively from Next.js) to render build/icon.svg at sizes:
  16, 32, 64, 128, 256, 512, 1024
Writes PNG files for 256/512/1024.
Builds binary .icns using Apple OSType codes:
  16→icp4, 32→icp5, 64→icp6, 128→ic07, 256→ic08, 512→ic09, 1024→ic10
Format: "icns" magic + uint32BE total length + (type[4] + uint32BE len + pngData)*
```

### `build/icon.svg`
1024×1024 SVG. Rounded rect (`rx=229`) with green gradient (#2E6661→#1B4239) + grid pattern. Yellow dot cluster top-right (r=22/12/8). Mint dots bottom-left. White K letterform (vertical rect + two diagonal rects, lower diagonal in yellow #FFB500). Coral circle at 770,520 for ".AI" accent.

---

## Part 9 — Known Bugs & Critical Fixes

### Bug 1: App launches with no window (packaged .dmg)
**Root cause:** Next.js standalone tracing walked up to the lockfile and embedded absolute host paths (e.g. `/home/daniellozano/Desktop/...`). Those paths don't exist inside `/Applications/KindWorks Usage.app`.

**Fix — `next.config.ts`:**
```ts
outputFileTracingRoot: path.resolve(__dirname),
outputFileTracingExcludes: { "/*": ["node_modules/@img/**", "node_modules/sharp/**"] },
```

**Fix — `electron/main.js`:**
- Change `show: false` + `ready-to-show` to `show: true` with immediate splash data: URL
- Check `fs.existsSync(serverPath)` before spawning — show dialog if missing
- Surface server log in `dialog.showErrorBox()` on failure

### Bug 2: Universal build fails — Sharp arch-merge error
**Root cause:** Sharp ships platform-native `.node` binaries. `electron-builder --universal` uses `lipo` to merge arch binaries, which fails for native addons.

**Fix:** Exclude Sharp from standalone trace (above). Change default `pack:mac` to `--arm64`. Keep `pack:mac-universal` as opt-in only.

### Bug 3: Google Fonts fail to load during `next build`
**Root cause:** `next/font/google` makes network requests at build time, which fails in sandboxed/air-gapped environments and breaks Electron builds.

**Fix:** Use plain `<link rel="stylesheet">` tags in `layout.tsx` `<head>`. Fonts load at runtime from the browser (web + Electron both work).

---

## Part 10 — Rebuild Instructions

### Step 1: Init project
```bash
npx create-next-app@16.2.3 kindworks-usage --typescript --tailwind --app --src-dir --import-alias "@/*"
cd kindworks-usage
```

### Step 2: Install all dependencies
```bash
npm install recharts lucide-react clsx tailwind-merge date-fns
npm install --save-dev electron@^41 electron-builder@^26 concurrently wait-on
```

### Step 3: Create all files
Follow Parts 1–8 above. Key order:
1. `next.config.ts` (add outputFileTracingRoot immediately)
2. `src/app/globals.css` (brand tokens)
3. `src/lib/anthropic-admin.ts` + `src/lib/utils.ts`
4. `src/hooks/useAdminKey.ts` + `src/hooks/useDashboardData.ts`
5. API routes (usage, members, validate-key)
6. UI components (KWLogo, button, card, badge, progress, input)
7. Dashboard components (ApiKeySetup, Header, SpendOverview, InsightCards, UsageChart, UserTable)
8. `src/app/layout.tsx` + `src/app/page.tsx`
9. `electron/main.js`
10. `scripts/prepare-electron.js` + `scripts/build-icon.js`
11. `build/icon.svg`
12. `.claude/settings.json`

### Step 4: Test web app
```bash
npm run dev   # → http://localhost:3000
# Enter sk-ant-admin-... key → should load dashboard
```

### Step 5: Build macOS app (requires macOS + Node 20+)
```bash
npm run build:icon    # SVG → ICNS (one-time)
npm run pack:mac      # → dist-electron/KindWorks Usage-0.1.0-arm64.dmg
```

### Step 6: Install
Open DMG, drag to Applications. On first launch: right-click → Open → Open (Gatekeeper bypass for unsigned app).

### Step 7: Git setup
```bash
git init
git add -A
git commit -m "Initial build — KindWorks Usage Dashboard"
git remote add origin https://github.com/YOUR_ORG/YOUR_REPO.git
git push -u origin main
```

---

## Quick Reference — Brand Semantic Colors

| Context | Color Token | Why |
|---------|-------------|-----|
| Primary CTA button | yellow | Warmth, action |
| Hero backgrounds | green-dark + kw-grid | Brand signature |
| Success / on track | mint | Soft positive |
| Warning / near limit | yellow | Caution |
| Danger / over limit | coral | Bold alert |
| Projected / forecast | purple | Inspiration |
| Hard data / proof | green | Trust |
| Admin role badge | yellow | Authority |
| Developer role badge | green | Builder |
| Billing role badge | mint | Finance |
| Readonly role badge | muted | Neutral |

---

*Footer copy: "Being Kind Works."*
