"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type Rol = "comprador" | "vendedor" | "admin";

export default function AuthGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Rol[];
}) {
  const { user, token, ready } = useAuth();
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!ready) return; // espera hidratación de localStorage
    const allowed = Boolean(user && token && allowedRoles.includes(user.rol));
    if (allowed) setOk(true);
    else router.replace("/login");
  }, [ready, user, token, allowedRoles, router]);

  if (!ready || !ok) return null; // evita “flash” de contenido
  return <>{children}</>;
}
