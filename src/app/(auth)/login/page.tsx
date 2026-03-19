// src/app/(auth)/login/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: { redirectTo?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <AuthHeroLayout
      title="Bienvenido de nuevo"
      subtitle="Vuelve a conectar con la riqueza textil de Guatemala y continúa explorando piezas auténticas creadas por manos locales."
    >
      <LoginForm redirectTo={searchParams.redirectTo} />
    </AuthHeroLayout>
  );
}
