// src/services/apiClient.ts

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"
).replace(/\/$/, "");

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // ✅ Crear Headers correctamente tipado
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 🔴 Manejo global 401
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login?expired=1";
    }

    throw new Error("Sesión inválida");
  }

  return res;
}
