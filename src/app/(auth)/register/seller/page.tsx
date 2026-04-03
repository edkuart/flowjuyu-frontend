// src/app/(auth)/register/seller/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import RegisterVendedorForm from "@/features/auth/seller/RegisterVendedorForm";

export default function RegisterSellerPage() {
  return (
    <AuthHeroLayout
      titleKey="auth.registerSellerHeroTitle"
      subtitleKey="auth.registerSellerHeroSubtitle"
    >
      <RegisterVendedorForm />
    </AuthHeroLayout>
  );
}
