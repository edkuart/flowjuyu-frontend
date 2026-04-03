// src/app/(auth)/register/buyer/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import RegisterForm from "@/features/auth/RegisterCompradorForm";

export default function RegisterPage() {
  return (
    <AuthHeroLayout
      titleKey="auth.registerBuyerHeroTitle"
      subtitleKey="auth.registerBuyerHeroSubtitle"
    >
      <RegisterForm />
    </AuthHeroLayout>
  );
}
