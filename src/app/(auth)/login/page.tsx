// src/app/(auth)/login/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: { redirectTo?: string; switch?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const allowAuthenticated = searchParams.switch === "1";

  return (
    <AuthHeroLayout
      titleKey="auth.loginHeroTitle"
      subtitleKey="auth.loginHeroSubtitle"
    >
      <LoginForm
        redirectTo={searchParams.redirectTo}
        allowAuthenticated={allowAuthenticated}
      />
    </AuthHeroLayout>
  );
}
