// src/services/sellerAccount.ts

/* =========================================================
   📦 Tipos oficiales del estado de cuenta del vendedor
========================================================= */

export type EstadoValidacion =
  | "pendiente"
  | "en_revision"
  | "aprobado"
  | "rechazado"

export interface SellerAccountStatus {
  estado_validacion: EstadoValidacion
  ultima_revision: string | null
  observaciones_generales: string | null

  documentos: {
    dpi_frente: { subido: boolean }
    dpi_reverso: { subido: boolean }
    selfie_con_dpi: { subido: boolean }
  }

  puede_publicar: boolean
  visible_publicamente: boolean
}

/* =========================================================
   🔎 Obtener estado de cuenta del vendedor
========================================================= */

export async function apiGetSellerAccountStatus(): Promise<
  | { ok: true; data: SellerAccountStatus }
  | { ok: false; error?: string }
> {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/account-status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    )

    if (!res.ok) {
      return {
        ok: false,
        error: "No se pudo obtener el estado de la cuenta",
      }
    }

    const data = (await res.json()) as SellerAccountStatus

    return {
      ok: true,
      data,
    }
  } catch (error) {
    console.error("Error apiGetSellerAccountStatus:", error)

    return {
      ok: false,
      error: "Error de red o servidor",
    }
  }
}
