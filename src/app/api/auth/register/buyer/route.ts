import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/lib/config";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as
    | {
        nombre?: string;
        correo?: string;
        contraseña?: string;
        rol?: string;
        telefono?: string | null;
        direccion?: string | null;
        accepted_legal_terms?: boolean;
      }
    | null;

  if (!body?.accepted_legal_terms) {
    return NextResponse.json(
      {
        ok: false,
        message: "Debes aceptar los Términos y la Política de Privacidad.",
      },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${getApiUrl()}/api/register`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: body.nombre,
      correo: body.correo,
      contraseña: body.contraseña,
      rol: body.rol ?? "buyer",
      telefono: body.telefono ?? null,
      direccion: body.direccion ?? null,
      terms_accepted_at: new Date().toISOString(),
      terms_version: LEGAL_TERMS_VERSION,
    }),
  });

  const data = await upstream.json().catch(() => null);

  return NextResponse.json(
    data ?? { ok: false, message: "Error al registrar comprador" },
    { status: upstream.status || 500 },
  );
}
