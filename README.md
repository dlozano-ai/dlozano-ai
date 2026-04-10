# Claude Org Usage Dashboard

A Next.js web app that lets you monitor Claude API usage, costs, and spend limits across your entire Anthropic organization — viewable from any Mac.

## Features

- **Spend overview** — total MTD spend vs monthly limit with visual progress bar
- **Key insights** — top model, top spender, avg daily spend, projected monthly cost
- **Daily spend chart** — area chart of spend over the selected period
- **Model breakdown** — bar + pie charts showing cost by Claude model
- **Member table** — per-user MTD spend, token usage, and budget utilization, sortable and searchable
- **Date range picker** — Month to Date, Last 30 Days, Last 7 Days
- **Auto-refresh** — manual refresh with last-updated timestamp

## Setup

### 1. Get an Admin API Key

1. Go to [Anthropic Console → Admin Keys](https://console.anthropic.com/settings/admin-keys)
2. Click **Create Admin Key**
3. Copy the key — it starts with `sk-ant-admin-...`

> Admin keys are different from regular API keys. They allow read access to organization usage data.

### 2. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your Admin API key, and click **Connect**.

### 3. Deploy (optional)

Deploy to any platform that supports Next.js (Vercel, Railway, Fly.io, etc.) for access from any device.

```bash
npm run build
npm start
```

## API Endpoints Used

| Endpoint | Purpose |
|---|---|
| `GET /v1/organizations/members` | List all org members |
| `GET /v1/workspaces` | List workspaces |
| `GET /v1/usage` | Token + cost usage data |

## Security

- Your Admin API key is stored **only in your browser's localStorage**
- All API calls are proxied through the Next.js server (never exposed to the browser directly)
- No data is sent to any third-party services

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Recharts** for charts
- **Lucide React** for icons
