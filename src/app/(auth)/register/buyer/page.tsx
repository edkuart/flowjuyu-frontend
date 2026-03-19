// src/app/(auth)/register/buyer/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import RegisterForm from "@/features/auth/RegisterCompradorForm";

export default function RegisterPage() {
  return (
    <AuthHeroLayout
      title="Crea tu cuenta"
      subtitle="Únete a Flowjuyu y comienza a descubrir piezas textiles auténticas creadas por artesanos locales."
    >
      <RegisterForm />
    </AuthHeroLayout>
  );
}
