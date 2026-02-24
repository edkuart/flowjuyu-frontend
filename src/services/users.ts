// src/services/users.ts

import type { User } from "@/types/db";
import { apiFetch } from "./apiClient";

// =====================================================
// 🔹 Obtener usuario autenticado
// =====================================================
export async function apiGetUser(): Promise<{
  ok: boolean;
  user?: User | null;
  message?: string;
}> {
  try {
    const res = await apiFetch("/api/me", {
      method: "GET",
      credentials: "include", // importante si usas cookie JWT
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok || json?.ok === false) {
      return {
        ok: false,
        user: null,
        message: json?.message || "No autenticado",
      };
    }

    return {
      ok: true,
      user: json.user ?? null,
    };
  } catch (err: any) {
    console.error("❌ Error obteniendo usuario:", err);

    return {
      ok: false,
      user: null,
      message: err.message || "Error de red o servidor",
    };
  }
}

// =====================================================
// 🔹 Validar token manualmente
// =====================================================
export async function apiValidateToken(
  token: string
): Promise<boolean> {
  try {
    const res = await apiFetch("/api/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.ok;
  } catch {
    return false;
  }
}