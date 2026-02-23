// src/lib/api.ts

import { signOut } from "next-auth/react"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL no está configurado")
}

export async function apiFetch(
  input: string,
  init: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const url =
    input.startsWith("http")
      ? input
      : `${BASE_URL}${input}`

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (res.status === 401) {
    const data = await res.clone().json().catch(() => null)

    if (data?.code === "TOKEN_EXPIRED") {
      localStorage.removeItem("token")
      await signOut({ callbackUrl: "/login" })
      throw new Error("TOKEN_EXPIRED")
    }
  }

  return res
}