"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, Role } from "@/context/AuthContext";
import { useSession } from "next-auth/react";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const router = useRouter();
  const { user, token, ready } = useAuth();
  const { data: session, status } = useSession();

  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
  if (!ready || status === "loading") return;

  console.log("🔎 AuthGuard user:", user);
  console.log("🔎 AuthGuard user.rol:", user?.rol);
  console.log("🔎 AuthGuard allowedRoles:", allowedRoles);

  if (user && token && allowedRoles.includes(user.rol)) {
    console.log("✅ Autorizado por AuthContext");
    setAuthorized(true);
    return;
  }

  const sessionRole = (session?.user as any)?.role;

  console.log("🔎 NextAuth role:", sessionRole);

  if (
    session?.user &&
    sessionRole &&
    allowedRoles.includes(sessionRole)
  ) {
    console.log("✅ Autorizado por NextAuth");
    setAuthorized(true);
    return;
  }

  console.log("❌ No autorizado");
  setAuthorized(false);
}, [ready, status, user, token, session, allowedRoles]);

  useEffect(() => {
    if (authorized === false) {
      router.replace("/login");
    }
  }, [authorized, router]);

  if (!ready || status === "loading" || authorized === null) {
    return null;
  }

  if (authorized === false) {
    return null;
  }

  return <>{children}</>;
}