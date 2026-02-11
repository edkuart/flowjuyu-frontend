// src/lib/api.ts

import { signOut } from "next-auth/react"

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const res = await fetch(input, {
    ...init,
    headers: {
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
