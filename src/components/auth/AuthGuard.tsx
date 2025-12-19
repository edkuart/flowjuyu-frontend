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

  // AuthContext (localStorage)
  const { user, token, ready } = useAuth();

  // NextAuth (Google)
  const { data: session, status } = useSession();

  const [ok, setOk] = useState(false);

  useEffect(() => {
    // Esperar a que ambos sistemas estén “listos”
    const nextAuthReady = status !== "loading";
    if (!ready || !nextAuthReady) return;

    // 1) primero intentamos por AuthContext
    if (user && token && allowedRoles.includes(user.rol)) {
      setOk(true);
      return;
    }

    // 2) fallback por NextAuth session (si existe)
    const sessionRole = normalizeRole((session?.user as any)?.role || (session as any)?.role);
    if (session?.user && sessionRole && allowedRoles.includes(sessionRole)) {
      setOk(true);
      return;
    }

    router.replace("/");
  }, [ready, status, user, token, session, allowedRoles, router]);

  if (!ready || status === "loading" || !ok) return null;
  return <>{children}</>;
}
