//src/services/auth.ts

const API = process.env.NEXT_PUBLIC_API_URL!

// =====================
// Registro de comprador
// =====================
export async function apiRegisterComprador(data: {
  nombre: string
  email: string
  password: string
  confirmarPassword?: string
  telefono?: string
  direccion?: string
}) {
  try {
    const res = await fetch(`${API}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: data.nombre,
        correo: data.email,
        contraseña: data.password,
        rol: "buyer",
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      return { ok: false, message: json.message || "Error desconocido" }
    }

    return {
      ok: true,
      user: json.user,
      token: json.token,
    }
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" }
  }
}

// =====================
// Registro de vendedor
// =====================
export async function apiRegisterSeller(formData: FormData) {
  try {
    const res = await fetch(`${API}/api/register/seller`, {
      method: "POST",
      body: formData,
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        ok: false,
        message: json.message || "Error al registrar vendedor",
      }
    }

    return {
      ok: true,
      user: json.user,
      token: json.token,
    }
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" }
  }
}

// =====================
// Login
// =====================
export async function apiLogin(data: {
  correo: string
  password: string
}) {
  try {
    const res = await fetch(`${API}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo: data.correo,
        password: data.password,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      return {
        ok: false,
        message: json.message || "Credenciales incorrectas",
      }
    }

    localStorage.setItem("token", json.token)

    return {
      ok: true,
      user: json.user,
      token: json.token,
    }
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" }
  }
}

// =====================
// Logout
// =====================
export async function apiLogout() {
  try {
    const res = await fetch(`${API}/api/logout`, {
      method: "POST",
      credentials: "include",
    })

    const json = await res.json()

    if (!res.ok) {
      return { ok: false, message: json.message || "Error al cerrar sesión" }
    }

    localStorage.removeItem("token")

    return { ok: true }
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" }
  }
}