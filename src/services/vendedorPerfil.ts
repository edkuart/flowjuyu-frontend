//src/services/vendedorPerfil.ts

import type { VendedorPerfil } from "@/types/db";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800").replace(/\/$/, "");

// =====================================================
// 🔹 Obtener perfil de vendedor
// =====================================================
export async function apiGetVendedorPerfil(userId: number): Promise<{
  ok: boolean;
  perfil?: VendedorPerfil | null;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_URL}/api/seller/profile/${userId}`, {
      method: "GET",
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return { ok: false, perfil: null, message: json?.message || "Perfil no encontrado" };
    }

    return { ok: true, perfil: json.perfil ?? json };
  } catch (err) {
    console.error("❌ Error obteniendo perfil vendedor:", err);
    return { ok: false, perfil: null, message: "Error de red o servidor" };
  }
}

// =====================================================
// 🔹 Crear o actualizar perfil de vendedor
// =====================================================
export async function apiUpsertVendedorPerfil(formData: FormData): Promise<{
  ok: boolean;
  perfil?: VendedorPerfil | null;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_URL}/api/seller/profile`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return {
        ok: false,
        perfil: null,
        message: json?.message || "Error al guardar el perfil del vendedor",
      };
    }

    return { ok: true, perfil: json.perfil ?? json };
  } catch (err) {
    console.error("❌ Error actualizando perfil vendedor:", err);
    return { ok: false, perfil: null, message: "Error de red o servidor" };
  }
}
