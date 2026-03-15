"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/authFetch"

const API_URL = "http://localhost:8800"

export default function AdminLeadsPage() {

  const [data, setData] = useState<any>(null)

  async function fetchLeads() {

    const res = await authFetch(
      `${API_URL}/api/admin/leads`
    )

    if (!res.ok) return

    const json = await res.json()

    setData(json.data)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  if (!data) {
    return <div className="p-8">Cargando leads...</div>
  }

  return (
    <div className="space-y-10 p-8">

      <h1 className="text-2xl font-bold">
        Leads de vendedores
      </h1>

      {/* CONTACTOS WEB */}
      <section>
        <h2 className="font-semibold mb-4">
          Contactos desde la web
        </h2>

        {data.tickets.map((t: any) => (
          <div key={t.id} className="border p-4 rounded-lg">
            {t.asunto}
          </div>
        ))}
      </section>

      {/* INTENCIONES */}
      <section>
        <h2 className="font-semibold mb-4">
          Interés registrado
        </h2>

        {data.intentions.map((i: any) => (
          <div key={i.id} className="border p-4 rounded-lg">
            {i.nombre}
          </div>
        ))}
      </section>

      {/* SELLERS */}
      <section>
        <h2 className="font-semibold mb-4">
          Nuevos vendedores
        </h2>

        {data.sellers.map((s: any) => (
          <div key={s.id} className="border p-4 rounded-lg">
            {s.nombre_comercio}
          </div>
        ))}
      </section>

    </div>
  )
}