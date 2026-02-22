import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SupportDashboard() {
  const session = await getServerSession(authOptions);

  // Si no tiene sesión o no es soporte → fuera
  if (!session || session.user.role !== "support") {
    redirect("/");
  }

  // Traemos tickets del backend con el backendToken
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets`, {
    headers: {
      Authorization: `Bearer ${session.user.backendToken}`,
    },
    cache: "no-store",
  });

  const tickets = await res.json();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Panel de Soporte</h1>
      <p className="opacity-70">Bienvenido, {session.user.name}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <p>Total: {tickets.length}</p>
      </div>
    </div>
  );
}
