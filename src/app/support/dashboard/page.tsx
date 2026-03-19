export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSessionSafe } from "@/lib/serverSession";

// NOTE: The backend ticket fetch previously used a NextAuth `backendToken`
// that no longer exists in the custom JWT session. Ticket data must be
// fetched client-side using authFetch() from a client component child.
// This server component's job is auth verification + rendering the shell.

export default async function SupportDashboard() {
  const user = await getServerSessionSafe();

  if (!user || user.role !== "support") {
    redirect("/");
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Panel de Soporte</h1>
      <p className="opacity-70">Bienvenido, {user.name}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Cargando tickets...
        </p>
      </div>
    </div>
  );
}
