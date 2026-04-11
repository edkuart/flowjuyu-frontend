import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/lib/config";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        id_token?: string;
        accepted_legal_terms?: boolean;
      }
    | null;

  if (!body?.id_token) {
    return NextResponse.json(
      { ok: false, message: "Solicitud inválida." },
      { status: 400 },
    );
  }

  if (!body.accepted_legal_terms) {
    return NextResponse.json(
      {
        ok: false,
        message: "Debes aceptar los Términos y la Política de Privacidad.",
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${getApiUrl()}/api/login/google`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id_token: body.id_token,
      terms_accepted_at: new Date().toISOString(),
      terms_version: LEGAL_TERMS_VERSION,
    }),
  });

  const data = await upstream.json().catch(() => null);

  return NextResponse.json(
    data ?? { ok: false, message: "No se pudo continuar con Google." },
    { status: upstream.status || 500 },
  );
}
