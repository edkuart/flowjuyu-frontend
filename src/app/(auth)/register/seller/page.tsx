// src/app/(auth)/register/seller/page.tsx

import AuthHeroLayout from "@/components/auth/AuthHeroLayout";
import RegisterVendedorForm from "@/features/auth/seller/RegisterVendedorForm";

export default function RegisterSellerPage() {
  return (
    <AuthHeroLayout
      title="Crea tu tienda"
      subtitle="Registra tu comercio en Flowjuyu y conecta con compradores que valoran la autenticidad textil guatemalteca."
    >
      <RegisterVendedorForm />
    </AuthHeroLayout>
  );
}
