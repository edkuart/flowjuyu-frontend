"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { authFetch } from "@/lib/authFetch"

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"

export default function NewSellerTicketPage() {
  const router = useRouter()

  const [asunto, setAsunto] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [tipo, setTipo] = useState("soporte")
  const [prioridad, setPrioridad] = useState("media")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!asunto.trim() || !mensaje.trim()) return

    try {
      setLoading(true)

      const res = await authFetch(
        `${API}/api/seller/tickets`,
        {
          method: "POST",
          body: JSON.stringify({
            asunto,
            mensaje,
            tipo,
            prioridad,
          }),
        }
      )

      if (!res.ok) {
        console.error(await res.text())
        return
      }

      router.push("/seller/tickets")
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef] p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-8 space-y-6">

        <h1 className="text-2xl font-bold">
          Crear nuevo ticket
        </h1>

        <div className="space-y-2">
          <Label>Asunto</Label>
          <Input
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej. Problema con validación"
          />
        </div>

        <div className="space-y-2">
          <Label>Mensaje</Label>
          <Textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Describe tu problema..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="space-y-2">
            <Label>Tipo</Label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="soporte">Soporte</option>
              <option value="verificacion">
                Verificación
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>Prioridad</Label>
            <select
              value={prioridad}
              onChange={(e) => setPrioridad(e.target.value)}
              className="w-full border rounded-xl px-3 py-2"
            >
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>

        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear ticket"}
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              router.push("/seller/tickets")
            }
          >
            Cancelar
          </Button>
        </div>

      </div>
    </div>
  )
}
