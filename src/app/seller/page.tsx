import { redirect } from "next/navigation"
import AuthGuard from "@/components/auth/AuthGuard"

export default function SellerPage() {
  return (
    <AuthGuard allowedRoles={["vendedor"]}>
      {redirect("/seller/my-business")}
    </AuthGuard>
  )
}
