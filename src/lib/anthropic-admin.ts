/**
 * Anthropic Admin API Client
 *
 * Requires an Admin API key (starts with sk-ant-admin-...)
 * Get yours at: https://console.anthropic.com/settings/admin-keys
 *
 * Docs: https://docs.anthropic.com/en/api/administration
 */

const ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
const ANTHROPIC_VERSION = "2023-06-01";

export type MemberRole = "admin" | "developer" | "billing" | "readonly";

export interface OrgMember {
  id: string;
  type: "user";
  name: string;
  email: string;
  role: MemberRole;
  created_at: string;
}

export interface Workspace {
  id: string;
  type: "workspace";
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  workspace_role: string;
}

export interface UsageRecord {
  timestamp: string;
  organization_id: string;
  workspace_id: string | null;
  api_key_id: string | null;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export interface UsageResponse {
  data: UsageRecord[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export interface MembersResponse {
  data: OrgMember[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export interface WorkspacesResponse {
  data: Workspace[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export interface UsageQueryParams {
  start_time?: string;
  end_time?: string;
  limit?: number;
  workspace_id?: string;
  api_key_id?: string;
}

// Token cost per million (in USD)
export const MODEL_PRICING: Record<
  string,
  { input: number; output: number; cacheWrite: number; cacheRead: number }
> = {
  "claude-opus-4-5": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-sonnet-4-5": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-haiku-4-5": { input: 0.8, output: 4, cacheWrite: 1, cacheRead: 0.08 },
  "claude-opus-4-0": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-sonnet-4-0": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-3-5-sonnet-20241022": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-3-5-sonnet-20240620": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-3-5-haiku-20241022": { input: 0.8, output: 4, cacheWrite: 1, cacheRead: 0.08 },
  "claude-3-opus-20240229": { input: 15, output: 75, cacheWrite: 18.75, cacheRead: 1.5 },
  "claude-3-sonnet-20240229": { input: 3, output: 15, cacheWrite: 3.75, cacheRead: 0.3 },
  "claude-3-haiku-20240307": { input: 0.25, output: 1.25, cacheWrite: 0.3, cacheRead: 0.03 },
};

export function calculateCost(record: UsageRecord): number {
  // Find matching pricing - try exact match, then prefix match
  let pricing = MODEL_PRICING[record.model];
  if (!pricing) {
    for (const [key, val] of Object.entries(MODEL_PRICING)) {
      if (record.model.startsWith(key) || key.startsWith(record.model.split("-20")[0])) {
        pricing = val;
        break;
      }
    }
  }
  if (!pricing) {
    // Default to Sonnet pricing if unknown
    pricing = MODEL_PRICING["claude-3-5-sonnet-20241022"];
  }
  const inputCost = (record.input_tokens / 1_000_000) * pricing.input;
  const outputCost = (record.output_tokens / 1_000_000) * pricing.output;
  const cacheWriteCost = (record.cache_creation_input_tokens / 1_000_000) * pricing.cacheWrite;
  const cacheReadCost = (record.cache_read_input_tokens / 1_000_000) * pricing.cacheRead;
  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

class AnthropicAdminClient {
  private adminKey: string;

  constructor(adminKey: string) {
    this.adminKey = adminKey;
  }

  private async fetch<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${ANTHROPIC_BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
      });
    }
    const res = await fetch(url.toString(), {
      headers: {
        "x-api-key": this.adminKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err?.error?.message ?? `HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  // Paginate through all results
  private async fetchAll<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T[]> {
    const all: T[] = [];
    let afterId: string | undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const p = { limit: "100", ...(params ?? {}), ...(afterId ? { after_id: afterId } : {}) };
      const page = await this.fetch<{ data: T[]; has_more: boolean; last_id: string | null }>(
        path,
        p
      );
      all.push(...page.data);
      if (!page.has_more || !page.last_id) break;
      afterId = page.last_id;
    }
    return all;
  }

  async getMembers(): Promise<OrgMember[]> {
    return this.fetchAll<OrgMember>("/organizations/members");
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return this.fetchAll<Workspace>("/workspaces");
  }

  async getUsage(params: UsageQueryParams = {}): Promise<UsageRecord[]> {
    const qp: Record<string, string> = {};
    if (params.start_time) qp.start_time = params.start_time;
    if (params.end_time) qp.end_time = params.end_time;
    if (params.workspace_id) qp.workspace_id = params.workspace_id;
    if (params.api_key_id) qp.api_key_id = params.api_key_id;

    return this.fetchAll<UsageRecord>("/usage", qp);
  }
}

export function createAdminClient(adminKey: string) {
  return new AnthropicAdminClient(adminKey);
}
