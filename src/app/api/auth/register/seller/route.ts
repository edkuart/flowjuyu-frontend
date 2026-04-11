import { NextRequest, NextResponse } from "next/server";

import { handleOnboardingEvent } from "@/services/onboardingListeners";
import { getApiUrl } from "@/lib/config";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  if (formData.get("accepted_legal_terms") !== "true") {
    return NextResponse.json(
      {
        ok: false,
        message: "Debes aceptar los Términos y la Política de Privacidad.",
      },
      { status: 400 },
    );
  }

  formData.delete("accepted_legal_terms");
  formData.set("terms_accepted_at", new Date().toISOString());
  formData.set("terms_version", LEGAL_TERMS_VERSION);

  const upstream = await fetch(`${getApiUrl()}/api/register/seller`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  const data = (await upstream.json().catch(() => null)) as
    | {
        user?: {
          id?: number;
          nombre?: string;
          correo?: string;
          perfil?: {
            nombre_comercio?: string | null;
            email_welcome_sent_at?: string | null;
            email_activation_sent_at?: string | null;
            email_week1_sent_at?: string | null;
          } | null;
        };
        token?: string;
        forceLogout?: boolean;
        message?: string;
      }
    | null;

  if (!upstream.ok || !data) {
    return NextResponse.json(
      data ?? { ok: false, message: "Error al registrar vendedor" },
      { status: upstream.status || 500 },
    );
  }

  const userId = data.user?.id;
  const email = data.user?.correo;
  const name = data.user?.nombre;
  const storeName = data.user?.perfil?.nombre_comercio ?? null;
  const welcomeSentAt = data.user?.perfil?.email_welcome_sent_at ?? null;

  if (userId && email && name && !welcomeSentAt) {
    try {
      await handleOnboardingEvent({
        type: "seller_created",
        seller: {
          userId,
          email,
          name,
          storeName,
          email_welcome_sent_at: welcomeSentAt,
          email_activation_sent_at: data.user?.perfil?.email_activation_sent_at ?? null,
          email_week1_sent_at: data.user?.perfil?.email_week1_sent_at ?? null,
        },
      });
    } catch (error) {
      console.error("[register/seller] Failed to emit seller_created:", error);
    }
  }

  return NextResponse.json(data, { status: upstream.status });
}
