import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, calculateCost } from "@/lib/anthropic-admin";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!adminKey) {
    return NextResponse.json({ error: "Missing admin API key" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const startTime = searchParams.get("start_time") ?? undefined;
  const endTime = searchParams.get("end_time") ?? undefined;
  const workspaceId = searchParams.get("workspace_id") ?? undefined;

  try {
    const client = createAdminClient(adminKey);
    const records = await client.getUsage({ start_time: startTime, end_time: endTime, workspace_id: workspaceId });

    // Aggregate by day
    const byDay: Record<string, { date: string; cost: number; input_tokens: number; output_tokens: number }> = {};
    // Aggregate by model
    const byModel: Record<string, { model: string; cost: number; input_tokens: number; output_tokens: number }> = {};
    // Aggregate by api_key (user proxy)
    const byApiKey: Record<string, { api_key_id: string; cost: number; input_tokens: number; output_tokens: number }> = {};

    let totalCost = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    for (const r of records) {
      const cost = calculateCost(r);
      totalCost += cost;
      totalInputTokens += r.input_tokens;
      totalOutputTokens += r.output_tokens;

      // Daily aggregation
      const day = r.timestamp.slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, cost: 0, input_tokens: 0, output_tokens: 0 };
      byDay[day].cost += cost;
      byDay[day].input_tokens += r.input_tokens;
      byDay[day].output_tokens += r.output_tokens;

      // Model aggregation
      if (!byModel[r.model]) byModel[r.model] = { model: r.model, cost: 0, input_tokens: 0, output_tokens: 0 };
      byModel[r.model].cost += cost;
      byModel[r.model].input_tokens += r.input_tokens;
      byModel[r.model].output_tokens += r.output_tokens;

      // API key aggregation
      const keyId = r.api_key_id ?? "unknown";
      if (!byApiKey[keyId]) byApiKey[keyId] = { api_key_id: keyId, cost: 0, input_tokens: 0, output_tokens: 0 };
      byApiKey[keyId].cost += cost;
      byApiKey[keyId].input_tokens += r.input_tokens;
      byApiKey[keyId].output_tokens += r.output_tokens;
    }

    return NextResponse.json({
      summary: { totalCost, totalInputTokens, totalOutputTokens, recordCount: records.length },
      byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
      byModel: Object.values(byModel).sort((a, b) => b.cost - a.cost),
      byApiKey: Object.values(byApiKey).sort((a, b) => b.cost - a.cost),
      raw: records,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("401") ? 401 : message.includes("403") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
