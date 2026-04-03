// src/app/(auth)/login/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import { LoginForm } from "@/components/auth/LoginForm";

interface Props {
  searchParams: { redirectTo?: string };
}

export default function LoginPage({ searchParams }: Props) {
  return (
    <AuthHeroLayout
      titleKey="auth.loginHeroTitle"
      subtitleKey="auth.loginHeroSubtitle"
    >
      <LoginForm redirectTo={searchParams.redirectTo} />
    </AuthHeroLayout>
  );
}
