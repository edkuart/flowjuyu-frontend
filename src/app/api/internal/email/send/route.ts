import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/server/email/email.service";

type EmailSendRequest = {
  to?: string;
  subject?: string;
  html?: string;
};

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.INTERNAL_EMAIL_API_SECRET;

  if (!expected) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const headerSecret = request.headers.get("x-internal-email-secret");

  return bearer === expected || headerSecret === expected;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as EmailSendRequest | null;

  if (!body?.to || !body.subject || !body.html) {
    return NextResponse.json(
      { ok: false, message: "Missing email payload" },
      { status: 400 },
    );
  }

  const result = await sendEmail(body.to, body.subject, body.html);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}
