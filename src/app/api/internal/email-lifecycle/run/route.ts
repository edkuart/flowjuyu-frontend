import { NextRequest, NextResponse } from "next/server";

import { runEmailLifecycleJob } from "@/services/emailLifecycle.service";

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.EMAIL_CRON_SECRET;

  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-cron-secret");

  return bearer === expected || headerSecret === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await runEmailLifecycleJob();
    return NextResponse.json({ ok: true, results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected lifecycle job error";

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
