import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { adminKey } = await req.json().catch(() => ({}));
  if (!adminKey) {
    return NextResponse.json({ valid: false, error: "No key provided" }, { status: 400 });
  }

  try {
    // Try to list members as a validation check
    const res = await fetch("https://api.anthropic.com/v1/organizations/members?limit=1", {
      headers: {
        "x-api-key": adminKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
    });

    if (res.ok) {
      return NextResponse.json({ valid: true });
    }

    const body = await res.json().catch(() => ({}));
    return NextResponse.json(
      { valid: false, error: body?.error?.message ?? `HTTP ${res.status}` },
      { status: 200 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ valid: false, error: message }, { status: 200 });
  }
}
