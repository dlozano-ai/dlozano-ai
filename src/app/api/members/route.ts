import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/anthropic-admin";

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get("x-admin-key") ?? "";
  if (!adminKey) {
    return NextResponse.json({ error: "Missing admin API key" }, { status: 401 });
  }

  try {
    const client = createAdminClient(adminKey);
    const [members, workspaces] = await Promise.all([
      client.getMembers(),
      client.getWorkspaces(),
    ]);
    return NextResponse.json({ members, workspaces });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("401") ? 401 : message.includes("403") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
