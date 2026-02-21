//src/app/(auth)/layout.tsx

"use client";

import { usePathname } from "next/navigation";
import AuthHeroLayout from "@/components/auth/AuthHeroLayout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isLogin = pathname.includes("login");
  const isSeller = pathname.includes("seller");

  let title = "Crea tu cuenta";
  let subtitle =
    "Únete a Flowjuyu y comienza a descubrir piezas textiles auténticas creadas por artesanos locales.";

  if (isLogin) {
    title = "Bienvenido de nuevo";
    subtitle =
      "Vuelve a conectar con la riqueza textil de Guatemala y continúa explorando piezas auténticas creadas por manos locales.";
  }

  if (isSeller) {
    title = "Crea tu tienda";
    subtitle =
      "Registra tu comercio en Flowjuyu y conecta con compradores que valoran la autenticidad textil guatemalteca.";
  }

  return (
    <AuthHeroLayout title={title} subtitle={subtitle}>
      {children}
    </AuthHeroLayout>
  );
}