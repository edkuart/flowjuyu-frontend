// src/services/auth.ts
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800").replace(/\/$/, "");

// =====================
// Registro de comprador
// =====================
export async function apiRegisterComprador(data: {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword?: string;
  telefono?: string;
  direccion?: string;
}) {
  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: data.nombre,
        correo: data.email,
        contraseña: data.password,         // backend espera "contraseña"
        rol: "comprador",
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
      }),
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return { ok: false, message: json?.message || "Error desconocido" };
    }

    return {
      ok: true,
      user: json.user,   // { id, nombre, rol, ... }
      token: json.token, // JWT
    };
  } catch {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Registro de vendedor
// =====================
export async function apiRegisterSeller(formData: FormData) {
  try {
    const res = await fetch(`${API_URL}/api/register/seller`, {
      method: "POST",
      body: formData,            // ⚠️ no agregues Content-Type manual
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    // El backend devuelve { ok:true, id } o { ok:true, perfil:{...} }
    if (!res.ok || json?.ok === false) {
      return {
        ok: false,
        message: json?.message || "Error al registrar vendedor",
      };
    }

    return {
      ok: true,
      perfil: json.perfil ?? null,
      id: json.id ?? json.perfil?.id ?? null,
    };
  } catch {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Login
// =====================
export async function apiLogin(data: { email: string; password: string }) {
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: data.email, contraseña: data.password }),
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return { ok: false, message: json?.message || "Credenciales incorrectas" };
    }

    return {
      ok: true,
      user: json.user,
      token: json.token,
    };
  } catch {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Logout
// =====================
export async function apiLogout() {
  try {
    const res = await fetch(`${API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json?.ok === false) {
      return { ok: false, message: json?.message || "Error al cerrar sesión" };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Obtener sesión
// =====================
export async function apiGetSession() {
  try {
    const res = await fetch(`${API_URL}/api/session`, {
      method: "GET",
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    return json; // { ok: boolean, session?: {...} }
  } catch {
    return { ok: false, session: null };
  }
}
