// src/services/users.ts

import type { User } from "@/types/db";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800").replace(/\/$/, "");

// =====================================================
// 🔹 Obtener usuario autenticado (por cookie o token)
// =====================================================
export async function apiGetUser(): Promise<{ ok: boolean; user?: User | null; message?: string }> {
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      method: "GET",
      credentials: "include", // importante para JWT cookie
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return { ok: false, user: null, message: json?.message || "No autenticado" };
    }

    return { ok: true, user: json.user ?? null };
  } catch (err) {
    console.error("❌ Error obteniendo usuario:", err);
    return { ok: false, user: null, message: "Error de red o servidor" };
  }
}

// =====================================================
// 🔹 Validar token manualmente (si se usa Bearer)
// =====================================================
export async function apiValidateToken(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
