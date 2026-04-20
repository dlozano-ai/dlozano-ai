# Session Context — KindWorks Usage Dashboard

## Project

**Repo:** `dlozano-ai/dlozano-ai`
**Branch:** `claude/org-usage-dashboard-SdTLM`
**Working directory:** `/home/user/dlozano-ai` (remote dev environment)
**Local Mac clone:** wherever you ran `git clone https://github.com/dlozano-ai/dlozano-ai.git`

---

## What Was Built

A KindWorks.AI-branded macOS desktop app + web dashboard to monitor Claude API usage across your organization. Key features:

- **Spend overview** — MTD spend vs monthly limit, color-coded progress bar (mint → yellow → coral)
- **Key insights** — top model, top spender, avg daily spend, projected monthly cost
- **Usage trends** — daily area chart, model bar chart, spend pie chart
- **Member table** — per-user MTD spend, tokens, budget utilization, role badges
- **Date ranges** — Month to Date / Last 30 Days / Last 7 Days
- **Electron app** — packaged as a native `.dmg` installer for macOS

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.3 (App Router, `output: standalone`) |
| UI | React 19, TypeScript, Tailwind CSS v4 |
| Charts | Recharts |
| Fonts | DM Sans (body), Inter (headings), Source Serif 4 (italic emphasis) |
| Desktop | Electron 41 + electron-builder 26 |
| API | Anthropic Admin API (`sk-ant-admin-*` keys) |

---

## Key Files

```
src/
  app/
    page.tsx                    # Main dashboard page
    layout.tsx                  # Font loading, metadata
    globals.css                 # KindWorks brand tokens (CSS vars)
    api/
      usage/route.ts            # Proxies /v1/usage
      members/route.ts          # Proxies /v1/organizations/members
      validate-key/route.ts     # Key validation
  components/
    dashboard/
      ApiKeySetup.tsx           # Landing screen (dark-green hero)
      SpendOverview.tsx         # Hero spend card with kw-grid bg
      InsightCards.tsx          # 4 insight cards
      UsageChart.tsx            # Daily / model / pie charts
      UserTable.tsx             # Per-member table
    ui/
      KWLogo.tsx                # Full wordmark + monogram mark
      button.tsx                # Pill-shape buttons
      card.tsx                  # 28px radius cards
      progress.tsx              # Tone-aware progress bar
      badge.tsx                 # Semantic badges
  hooks/
    useAdminKey.ts              # localStorage key management
    useDashboardData.ts         # Data fetching + aggregation
  lib/
    anthropic-admin.ts          # Admin API client, MODEL_PRICING, pagination
    utils.ts                    # Formatters, chart colors, helpers

electron/
  main.js                       # Electron main process

scripts/
  prepare-electron.js           # Stages .next/standalone → app-dist/
  build-icon.js                 # SVG → ICNS via Sharp

next.config.ts                  # standalone + outputFileTracingRoot + Sharp exclusion
package.json                    # Scripts, electron-builder config
.claude/settings.json           # bypassPermissions default mode
```

---

## KindWorks Brand Tokens (globals.css)

```css
--kw-coral:      #ff474a   /* danger / alert */
--kw-green:      #2e6661   /* primary brand */
--kw-green-dark: #1b4239   /* hero backgrounds */
--kw-yellow:     #ffb500   /* accent / CTA */
--kw-purple:     #9c338c   /* projected / forecast */
--kw-mint:       #8fe0bf   /* success / positive */
--kw-radius-lg:  28px
--kw-radius-pill: 9999px
--kw-font-heading: "Jeko", "Inter", system-ui
--kw-font-body:    "DM Sans", system-ui
```

Signature patterns: `.kw-grid` (dark-green grid background), `.kw-dot` (yellow floating dots).

---

## Anthropic Admin API

- **Base URL:** `https://api.anthropic.com`
- **Key type:** `sk-ant-admin-...` — get from [console.anthropic.com/settings/admin-keys](https://console.anthropic.com/settings/admin-keys)
- **Endpoints used:**
  - `GET /v1/organizations/members` — list all org members
  - `GET /v1/usage` — usage records (paginated, filtered by start_time/end_time)
- **Auth header:** `x-api-key: <key>` + `anthropic-version: 2023-06-01`
- **Key storage:** localStorage only (`anthropic_admin_key`) — never sent anywhere except Anthropic's API

---

## Electron Architecture

```
Electron main (electron/main.js)
  ↓ spawns
Next.js standalone server (app-dist/server.js)
  bound to 127.0.0.1:<random port>
  ↓ serves
BrowserWindow → http://127.0.0.1:<port>/
```

All Anthropic API calls go through Next.js API routes — the admin key never touches the renderer process.

### Splash screen
Window opens immediately with a branded dark-green splash (inline `data:` URL) while Next.js boots. If the server fails to start, a native error dialog shows the server log tail.

---

## Build Scripts

```bash
# Web dashboard only
npm run dev          # Next.js dev server at http://localhost:3000
npm run build        # Production Next.js build

# macOS app (requires macOS + Node 20+)
npm run build:icon   # SVG → ICNS (run once, or after icon changes)
npm run pack:mac     # → dist-electron/KindWorks Usage-0.1.0-arm64.dmg  (Apple Silicon)
npm run pack:mac-x64 # → dist-electron/KindWorks Usage-0.1.0-x64.dmg   (Intel Mac)
npm run pack:mac-universal  # both arches in one DMG (slower, ~2× larger)

# Electron dev (live reload)
npm run electron:dev      # Next.js dev + Electron window
npm run electron:preview  # Full production build opened in Electron
```

### Clean rebuild (after pulling this branch)
```bash
rm -rf node_modules .next app-dist dist-electron
npm install
npm run build:icon
npm run pack:mac
```

---

## Bugs Fixed in This Session

### 1. App was 560MB and no window appeared
**Root cause:** Next.js standalone tracing embedded absolute host paths (e.g. `/home/daniellozano/Desktop/kindworks-usage/node_modules/...`). When the app moved into `/Applications`, those paths didn't exist → server silently failed → window never appeared (was `show: false` waiting for `ready-to-show`).

**Fix:**
- `next.config.ts`: added `outputFileTracingRoot: path.resolve(__dirname)` to pin paths to project root
- `electron/main.js`: changed to `show: true` with immediate splash screen so window is always visible

### 2. Universal build failed with Sharp arch-merge error
**Root cause:** Sharp ships native `.node` binaries per architecture. electron-builder's `--universal` flag tries to merge `arm64` and `x64` binaries with `lipo`, which fails for native addons.

**Fix:**
- `next.config.ts`: excluded `node_modules/@img/**` and `node_modules/sharp/**` from the standalone trace (Sharp is only used by `build:icon` at build time, not at runtime)
- `package.json`: changed default `pack:mac` to `--arm64`; `pack:mac-universal` kept as opt-in

---

## Claude Code Settings

`.claude/settings.json` in the repo sets `bypassPermissions` as the default mode so you don't get permission prompts when running `claude` on your Mac in this project.

---

## How to Install on Your Mac

1. **Pull the branch:**
   ```bash
   git clone https://github.com/dlozano-ai/dlozano-ai.git
   cd dlozano-ai
   git checkout claude/org-usage-dashboard-SdTLM
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the icon** (first time only):
   ```bash
   npm run build:icon
   ```

4. **Build the app:**
   ```bash
   npm run pack:mac        # Apple Silicon (M1/M2/M3/M4)
   npm run pack:mac-x64    # Intel Mac
   ```

5. **Install:**
   Open `dist-electron/KindWorks Usage-0.1.0-arm64.dmg`, drag to Applications.

6. **First launch:** macOS may warn "unidentified developer" → right-click the app → **Open** → **Open**.

7. **Connect:** Paste your `sk-ant-admin-...` key → click **Connect**.

---

## Open Questions / Future Work

- Code signing & notarization (removes the Gatekeeper warning) — needs Apple Developer ID cert
- `pack:mac-universal` will work once Sharp is fully out of the runtime bundle — currently tested arm64 only
- Slack integration for team review (no MCP available in this session)
