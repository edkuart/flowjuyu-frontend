import "server-only";

import { Resend } from "resend";

type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped?: boolean; error: string };

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("[email] RESEND_API_KEY is not configured");
    }

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function getEmailFrom(): string {
  const from = process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL;

  if (!from) {
    throw new Error("[email] EMAIL_FROM is not configured");
  }

  return from;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<SendEmailResult> {
  if (!to.trim()) {
    return { ok: false, skipped: true, error: "[email] Missing recipient" };
  }

  try {
    const resend = getResendClient();
    const from = getEmailFrom();
    const replyTo = process.env.EMAIL_REPLY_TO || undefined;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email delivery error";

    console.error("[email] sendEmail failed:", message);
    return { ok: false, error: message };
  }
}
