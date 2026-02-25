"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authFetch } from "@/lib/authFetch"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import SellerKYCPanel from "@/components/admin/SellerKYCPanel"

const API_URL = "http://localhost:8800"

// 🔥 Mantener soporte para rutas relativas y URLs completas
const resolveImageUrl = (url?: string | null) => {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${API_URL}${url}`
}

interface AuditEvent {
  id: number
  action: string
  comment: string | null
  performed_by: number
  created_at: string
  metadata?: any
}

interface SellerDetail {
  id: number
  user_id: number
  nombre_comercio: string
  descripcion: string | null
  estado_validacion: string
  estado_admin: string
  observaciones: string | null
  createdAt: string

  dpi: string | null
  foto_dpi_frente: string | null
  foto_dpi_reverso: string | null
  selfie_con_dpi: string | null
  logo: string | null
  departamento: string | null
  municipio: string | null

  user: {
    nombre: string
    correo: string
  }

    kyc_checklist: {
    dpi_legible?: boolean
    selfie_coincide?: boolean
    datos_coinciden?: boolean
    comercio_legitimo?: boolean
    ubicacion_coherente?: boolean
  } | null

  kyc_score: number
  kyc_riesgo: "bajo" | "medio" | "alto"

  audit_log: AuditEvent[]
}

export default function AdminSellerDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [seller, setSeller] = useState<SellerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [comment, setComment] = useState("")
  const [action, setAction] = useState<"reject" | "suspend" | null>(null)

  // =========================
  // Fetch detalle
  // =========================
  async function fetchDetail() {
    try {
      setLoading(true)

      const res = await authFetch(`${API_URL}/api/admin/sellers/${id}`)

      if (!res.ok) {
        toast.error("Error cargando vendedor")
        return
      }

      const data = await res.json()

      // 🔥 DEBUG TEMPORAL
      console.log("SELLER DATA:", data.data)

      setSeller(data.data)
    } catch (err) {
      console.error(err)
      toast.error("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchDetail()
  }, [id])

  // =========================
  // Acción unificada
  // =========================
  async function handleAction(endpoint: string, body?: any) {
    try {
      setProcessing(endpoint)

      const res = await authFetch(
        `${API_URL}/api/admin/sellers/${id}/${endpoint}`,
        {
          method: "PATCH",
          body: body ? JSON.stringify(body) : undefined,
        }
      )

      if (!res.ok) {
        toast.error("Ocurrió un error")
        return
      }

      const actionMap: Record<string, string> = {
        approve: "Vendedor aprobado",
        reject: "Vendedor rechazado",
        suspend: "Vendedor suspendido",
        reactivate: "Vendedor reactivado",
      }

      toast.success(actionMap[endpoint] || "Acción ejecutada")

      setComment("")
      setAction(null)
      fetchDetail()
    } catch {
      toast.error("Error inesperado")
    } finally {
      setProcessing(null)
    }
  }

  if (loading) return <div className="p-10">Cargando...</div>
  if (!seller) return <div className="p-10">Vendedor no encontrado</div>

  // =========================
  // Colores dinámicos
  // =========================
  const kycColor =
    seller.estado_validacion === "aprobado"
      ? "bg-green-50 border border-green-200 text-green-700 font-medium"
      : seller.estado_validacion === "rechazado"
      ? "bg-red-50 border border-red-200 text-red-700 font-medium"
      : "bg-yellow-50 border border-yellow-200 text-yellow-700 font-medium"

  const adminColor =
    seller.estado_admin === "activo"
      ? "bg-green-50 border border-green-200 text-green-700 font-medium"
      : seller.estado_admin === "suspendido"
      ? "bg-red-50 border border-red-200 text-red-700 font-medium"
      : "bg-gray-100 border border-gray-200 text-gray-700 font-medium"

  return (
    <div className="min-h-screen bg-white px-8 py-10 space-y-10">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 border-b pb-6">

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/admin/sellers")}
        >
          ← Volver a vendedores
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {seller.nombre_comercio}
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Usuario: {seller.user.nombre} — {seller.user.correo}
            </p>
          </div>

          <div className="flex gap-3">
            <Badge className={`${kycColor} px-4 py-1 text-sm`}>
              KYC: {seller.estado_validacion}
            </Badge>
            <Badge className={`${adminColor} px-4 py-1 text-sm`}>
              Operativo: {seller.estado_admin}
            </Badge>
          </div>
        </div>
      </div>

      {/* ================= BANNER SUSPENDIDO ================= */}
      {seller.estado_admin === "suspendido" && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          ⚠ Este vendedor está suspendido y no es visible en el marketplace.
        </div>
      )}

      {/* ================= INFORMACIÓN ================= */}
      <div className="bg-gray-50 p-6 rounded-xl border">
        <h3 className="text-base font-semibold tracking-tight mb-4">
          Información del vendedor
        </h3>

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500">Descripción</p>
            <p className="mt-1">{seller.descripcion || "—"}</p>
          </div>

          <div>
            <p className="text-gray-500">Observaciones</p>
            <p className="mt-1">{seller.observaciones || "—"}</p>
          </div>
        </div>
      </div>

      {/* ================= DOCUMENTOS KYC ================= */}
      <div className="bg-white p-6 rounded-xl border space-y-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Documentos KYC
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Información legal y verificación de identidad del vendedor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-sm">

          <div>
            <p className="text-gray-500">DPI</p>
            <p className="mt-1 font-medium">
              {seller.dpi || "No proporcionado"}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Ubicación</p>
            <p className="mt-1">
              {seller.departamento || "—"} / {seller.municipio || "—"}
            </p>
          </div>

        </div>

        {/* IMÁGENES */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {[
            { label: "Logo", url: seller.logo },
            { label: "DPI Frente", url: seller.foto_dpi_frente },
            { label: "DPI Reverso", url: seller.foto_dpi_reverso },
            { label: "Selfie con DPI", url: seller.selfie_con_dpi },
          ].map((doc) => (
            <div key={doc.label} className="space-y-2">
              <p className="text-xs text-gray-500">{doc.label}</p>

              {doc.url ? (
                <a
                  href={resolveImageUrl(doc.url) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={resolveImageUrl(doc.url) || ""}
                    alt={doc.label}
                    className="w-full h-40 object-cover rounded-lg border hover:opacity-90 transition"
                  />
                </a>
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-xs text-gray-400 rounded-lg border">
                  No disponible
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ================= PANEL KYC REVIEW ================= */}
      <SellerKYCPanel
        sellerId={seller.user_id}
        initialChecklist={seller.kyc_checklist}
      />

      {/* ================= GOBERNANZA ================= */}
      <div className="bg-white p-6 rounded-xl border space-y-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Gobernanza
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Acciones que afectan la validación y operación del vendedor.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">

          {/* ================= APROBAR / RECHAZAR ================= */}
          {seller.estado_validacion === "en_revision" && (
            <>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={processing === "approve"}
                onClick={() => {
                  if (seller.kyc_score < 80) {
                    alert("No se puede aprobar. Score KYC menor a 80%");
                    return;
                  }
                  if (!confirm("¿Aprobar vendedor?")) return;
                  handleAction("approve");
                }}
              >
                {processing === "approve" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Aprobar"
                )}
              </Button>

              <Button
                variant="destructive"
                disabled={processing === "reject"}
                onClick={() => setAction("reject")}
              >
                Rechazar
              </Button>
            </>
          )}

          {/* ================= SUSPENDER ================= */}
          {seller.estado_admin === "activo" && (
            <Button
              variant="destructive"
              disabled={processing === "suspend"}
              onClick={() => setAction("suspend")}
            >
              {processing === "suspend" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Suspender"
              )}
            </Button>
          )}

          {/* ================= REACTIVAR ================= */}
          {seller.estado_admin === "suspendido" && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={processing === "reactivate"}
              onClick={() => {
                if (!confirm("¿Reactivar vendedor?")) return;
                handleAction("reactivate");
              }}
            >
              {processing === "reactivate" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reactivar"
              )}
            </Button>
          )}
        </div>

        {/* ================= FORMULARIO DE COMENTARIO ================= */}
        {(action === "reject" || action === "suspend") && (
          <div className="space-y-4 pt-4 border-t">
            <textarea
              placeholder="Comentario obligatorio"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <div className="flex gap-3">
              <Button
                variant="destructive"
                disabled={processing === action || !comment.trim()}
                onClick={() => {
                  if (!confirm("¿Confirmar acción?")) return;
                  handleAction(action, { comment });
                }}
              >
                {processing === action ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar acción"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setAction(null);
                  setComment("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ================= HISTORIAL ================= */}
      <div className="bg-gray-50 p-6 rounded-xl border space-y-4">
        <h3 className="text-base font-semibold tracking-tight">
          Historial de acciones
        </h3>

        {seller.audit_log?.length === 0 && (
          <p className="text-sm text-gray-500">
            No hay eventos registrados
          </p>
        )}

        {seller.audit_log?.map((event) => {
          let color = "border-gray-300";
          let label = event.action;

          switch (event.action) {
            case "KYC_REVIEW_UPDATED":
              color = "border-blue-500";
              label = "KYC actualizado";
              break;

            case "KYC_APPROVED":
              color = "border-green-500";
              label = "KYC aprobado";
              break;

            case "KYC_REJECTED":
              color = "border-red-500";
              label = "KYC rechazado";
              break;

            case "SELLER_SUSPENDED":
              color = "border-red-500";
              label = "Vendedor suspendido";
              break;

            case "SELLER_REACTIVATED":
              color = "border-green-500";
              label = "Vendedor reactivado";
              break;
          }

          return (
            <div
              key={event.id}
              className={`border-l-4 ${color} pl-4 py-3 bg-white rounded-md shadow-sm`}
            >
              <div className="flex justify-between items-center">
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>

              {event.metadata?.after?.kyc_score && (
                <p className="text-xs mt-1 text-gray-600">
                  Score: {event.metadata.after.kyc_score}% — Riesgo:{" "}
                  {event.metadata.after.kyc_riesgo}
                </p>
              )}

              {event.comment && (
                <p className="text-sm mt-2 text-gray-700">
                  {event.comment}
                </p>
              )}
            </div>
          );
        })}
      </div>

    </div>
  )
}