// src/lib/api.ts
import { signOut } from "next-auth/react";

export async function apiFetch(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const res = await fetch(input, {
    ...init,
    credentials: "include", 
    headers: {
      ...(init.headers || {}),
    },
  });

  if (res.status === 401) {
    const data = await res.clone().json().catch(() => null);

    if (data?.code === "TOKEN_EXPIRED") {
      await signOut({ callbackUrl: "/login" });
      throw new Error("TOKEN_EXPIRED");
    }
  }

  return res;
}
