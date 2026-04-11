type EmailTemplateInput = {
  previewText: string;
  title: string;
  intro: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  closing: string;
  accountNotice?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEmailShell(input: EmailTemplateInput): string {
  const previewText = escapeHtml(input.previewText);
  const title = escapeHtml(input.title);
  const intro = escapeHtml(input.intro);
  const body = escapeHtml(input.body);
  const ctaLabel = escapeHtml(input.ctaLabel);
  const ctaUrl = escapeHtml(input.ctaUrl);
  const closing = escapeHtml(input.closing);
  const accountNotice = escapeHtml(
    input.accountNotice ?? "Recibes este mensaje porque tienes una cuenta en Flowjuyu.",
  );

  return `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5efe5;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5efe5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;">
            <tr>
              <td style="background:#0f3d3a;padding:24px 24px 18px;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:1.6px;text-transform:uppercase;opacity:.8;">Flowjuyu</div>
                <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <p style="margin:0 0 14px;font-size:16px;line-height:1.6;">${intro}</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">${body}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:999px;background:#c46d43;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:14px 22px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;">
                        ${ctaLabel}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">${closing}</p>
                <p style="margin:18px 0 0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  ${accountNotice}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
