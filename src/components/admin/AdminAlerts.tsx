"use client"

import { useRouter } from "next/navigation"

interface Props {
  sellersPendientes: number
  ticketsAbiertos: number
}

export function AdminAlerts({
  sellersPendientes,
  ticketsAbiertos,
}: Props) {
  const router = useRouter()

  const hasAlerts =
    sellersPendientes > 0 || ticketsAbiertos > 0

  if (!hasAlerts) {
    return (
      <div className="rounded-xl border bg-green-50 border-green-200 p-4 text-green-700">
        ✔ Todo está funcionando correctamente.
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {sellersPendientes > 0 && (
        <div
          onClick={() => router.push("/admin/sellers?kyc=pendiente")}
          className="rounded-xl border bg-yellow-50 border-yellow-200 p-4 text-yellow-800 cursor-pointer hover:shadow-sm"
        >
          ⚠ Hay {sellersPendientes} seller(s) pendientes de validación.
        </div>
      )}

      {ticketsAbiertos > 0 && (
        <div
          onClick={() =>
            router.push("/admin/tickets?estado=abierto")
          }
          className="rounded-xl border bg-red-50 border-red-200 p-4 text-red-700 cursor-pointer hover:shadow-sm"
        >
          🚨 Hay {ticketsAbiertos} ticket(s) abiertos que requieren atención.
        </div>
      )}

    </div>
  )
}