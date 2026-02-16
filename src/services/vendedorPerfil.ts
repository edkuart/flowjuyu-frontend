// src/services/vendedorPerfil.ts

import type { VendedorPerfil } from "@/types/db";
import { apiFetch } from "./apiClient";

// =====================================================
// 🔹 Obtener perfil autenticado del vendedor
// =====================================================
export async function apiGetVendedorPerfil(): Promise<{
  ok: boolean;
  perfil?: VendedorPerfil | null;
  message?: string;
}> {
  try {
    const res = await apiFetch("/api/seller/profile", {
      method: "GET",
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        perfil: null,
        message: json?.message || "Perfil no encontrado",
      };
    }

    return {
      ok: true,
      perfil: json ?? null,
    };
  } catch (err: any) {
    console.error("❌ Error obteniendo perfil vendedor:", err);

    return {
      ok: false,
      perfil: null,
      message: err.message || "Error de red o servidor",
    };
  }
}

// =====================================================
// 🔹 Crear o actualizar perfil de vendedor
// =====================================================
export async function apiUpsertVendedorPerfil(
  formData: FormData
): Promise<{
  ok: boolean;
  perfil?: VendedorPerfil | null;
  message?: string;
}> {
  try {
    const res = await apiFetch("/api/seller/profile", {
      method: "PUT",
      body: formData,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        perfil: null,
        message:
          json?.message || "Error al guardar el perfil del vendedor",
      };
    }

    return {
      ok: true,
      perfil: json.perfil ?? json,
    };
  } catch (err: any) {
    console.error("❌ Error actualizando perfil vendedor:", err);

    return {
      ok: false,
      perfil: null,
      message: err.message || "Error de red o servidor",
    };
  }
}