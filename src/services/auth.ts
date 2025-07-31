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
    const res = await fetch("http://localhost:8800/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: data.nombre,
        correo: data.email,
        contraseña: data.password,
        rol: "comprador",
        telefono: data.telefono?.trim() || null,
        direccion: data.direccion?.trim() || null,
      }),
    });

    const json = await res.json();
    console.log("Respuesta backend (comprador):", json);

    if (!res.ok) {
      return { ok: false, message: json.message || "Error desconocido" };
    }

    return {
      ok: true,
      user: json.user,      // { id, nombre, rol }
      token: json.token,    // JWT devuelto por backend
    };
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Registro de vendedor
// =====================
export async function apiRegisterSeller(formData: FormData) {
  try {
    const res = await fetch("http://localhost:8800/api/register/seller", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    console.log("Respuesta backend (vendedor):", json);

    if (!res.ok) {
      return {
        ok: false,
        message: json.message || "Error al registrar vendedor",
      };
    }

    return {
      ok: true,
      user: json.user,
      token: json.token,
    };
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Login
// =====================
export async function apiLogin(data: { email: string; password: string }) {
  try {
    const res = await fetch("http://localhost:8800/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    console.log("Respuesta backend (login):", json);

    if (!res.ok) {
      return { ok: false, message: json.message || "Credenciales incorrectas" };
    }

    return {
      ok: true,
      user: json.user,
      token: json.token,
    };
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" };
  }
}

// =====================
// Logout (cerrar sesión en backend y frontend)
// =====================
export async function apiLogout() {
  try {
    const res = await fetch("http://localhost:8800/api/logout", {
      method: "POST",
      credentials: "include", // ✅ importante para enviar cookie de sesión
    });

    const json = await res.json();
    if (!res.ok) {
      return { ok: false, message: json.message || "Error al cerrar sesión" };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: "Error de red o servidor" };
  }
}
