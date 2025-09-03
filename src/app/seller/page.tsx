
import AuthGuard from "@/components/auth/AuthGuard";

export default function SellerPage() {
  return (
    <AuthGuard allowedRoles={["vendedor"]}>
      <div className="p-4">
        <h1>Zona privada del vendedor 🛍️</h1>
      </div>
    </AuthGuard>
  );
}
