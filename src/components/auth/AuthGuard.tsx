//src/components/auth/AuthGuard.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, RolNormalized, normalizeRole } from "@/context/AuthContext";
import { useSession } from "next-auth/react";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: RolNormalized[];
}) {
  const router = useRouter();

  const { user, token, ready } = useAuth();
  const { data: session, status } = useSession();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  // null = loading
  // true = puede entrar
  // false = no autorizado

  useEffect(() => {
    if (!ready || status === "loading") return;

    // 1️⃣ AuthContext (login normal)
    if (user && token && allowedRoles.includes(user.rol)) {
      setAuthorized(true);
      return;
    }

    // 2️⃣ NextAuth (Google)
    const sessionRole = normalizeRole(
      (session?.user as any)?.role || (session as any)?.role
    );

    if (session?.user && sessionRole && allowedRoles.includes(sessionRole)) {
      setAuthorized(true);
      return;
    }

    // 3️⃣ No autorizado
    setAuthorized(false);
  }, [ready, status, user, token, session, allowedRoles]);

  // 🔁 Redirección SEPARADA (clave)
  useEffect(() => {
    if (authorized === false) {
      router.replace("/login");
    }
  }, [authorized, router]);

  // ⏳ Mientras decide
  if (!ready || status === "loading" || authorized === null) {
    return null;
  }

  // ❌ Ya sabemos que no puede entrar
  if (authorized === false) {
    return null;
  }

  // ✅ Autorizado
  return <>{children}</>;
}
