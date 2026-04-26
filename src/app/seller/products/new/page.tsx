// src/app/seller/products/new/page.tsx

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProductEditorShell } from "@/components/product-edit/ProductEditorShell"
import { useProductCreate } from "@/hooks/useProductCreate"
import { track } from "@/lib/analytics"
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil"

type EstadoValidacion = "pendiente" | "aprobado" | "rechazado"

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const legacyEditId = searchParams.get("id")
  const controller = useProductCreate()

  const [estadoValidacion, setEstadoValidacion] = useState<EstadoValidacion | null>(null)
  const [checkingEstado, setCheckingEstado] = useState(true)
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)

  useEffect(() => {
    if (legacyEditId) {
      router.replace(`/seller/productos/${legacyEditId}/editar`)
    }
  }, [legacyEditId, router])

  useEffect(() => {
    async function checkEstado() {
      try {
        const res = await apiGetVendedorPerfil()
        if (res.ok && res.perfil) {
          setEstadoValidacion(res.perfil.estado_validacion ?? null)
        }
      } catch {
        /* silent */
      } finally {
        setCheckingEstado(false)
      }
    }
    checkEstado()
  }, [])

  async function handleCreate(publish: boolean) {
    const result = await controller.createProduct({ publish })
    if (!result) return

    if (result.internal_code) {
      if (publish) {
        track("seller_first_product_published", {
          surface: "seller_product_create",
          internal_code: result.internal_code,
        })
      }
      setCreatedCode(result.internal_code)
      return
    }

    if (publish) {
      track("seller_first_product_published", {
        surface: "seller_product_create",
      })
    }
    router.push("/seller/products?first=1")
    router.refresh()
  }

  function handleSuccessModalClose() {
    setCreatedCode(null)
    setCodeCopied(false)
    router.push("/seller/products?first=1")
    router.refresh()
  }

  function copyInternalCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    }).catch(() => {
      const el = document.createElement("textarea")
      el.value = code
      el.style.position = "fixed"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    })
  }

  if (checkingEstado || legacyEditId) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-400 text-sm animate-pulse">
          Verificando estado del comercio…
        </p>
      </main>
    )
  }

  if (estadoValidacion !== "aprobado") {
    return (
      <main className="min-h-screen px-4 py-10 max-w-xl mx-auto flex items-center">
        <Card className="w-full border shadow-sm">
          <CardContent className="p-10 text-center space-y-4">
            <div className="text-5xl">⏳</div>
            <h2 className="text-xl font-bold text-neutral-800">
              Tu comercio está en revisión
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed">
              Estamos validando tu información. Este proceso tarda entre 1 y 24 horas.
              Te notificaremos por correo cuando sea aprobado.
            </p>
            <Link href="/seller/my-business">
              <Button variant="outline" className="mt-2">Volver a mi tienda</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const createState = controller.getSectionState("create")

  return (
    <>
      <ProductEditorShell
        controller={controller}
        onBack={() => router.push("/seller/products")}
        footerActions={
          <div className="rounded-xl border border-gray-100 bg-white px-4 py-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)]">
            <div className="space-y-2">
              {createState.status === "error" && createState.error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                  {createState.error}
                </div>
              )}

              <Button
                type="button"
                onClick={() => handleCreate(true)}
                disabled={controller.isSaving}
                className="h-11 w-full bg-[#0f2e22] font-semibold text-white hover:bg-[#184c37]"
              >
                {controller.isSaving ? "Creando…" : "Crear y publicar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreate(false)}
                disabled={controller.isSaving}
                className="h-10 w-full font-semibold"
              >
                {controller.isSaving ? "Guardando…" : "Guardar como borrador"}
              </Button>
            </div>
          </div>
        }
      />

      <Dialog
        open={!!createdCode}
        onOpenChange={(open) => {
          if (!open) handleSuccessModalClose()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              Producto creado correctamente
            </DialogTitle>
            <DialogDescription className="sr-only">
              Tu producto fue guardado en Flowjuyu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            <p className="text-sm text-neutral-500 leading-relaxed">
              Tu producto fue guardado. Aquí está tu código de referencia único en Flowjuyu.
            </p>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Código Flowjuyu
              </p>
              <div className="flex items-center justify-between gap-3">
                <code className="font-mono text-base font-bold text-neutral-800 tracking-wide select-all break-all">
                  {createdCode}
                </code>
                <button
                  type="button"
                  onClick={() => createdCode && copyInternalCode(createdCode)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    codeCopied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-orange-300 hover:text-orange-600"
                  }`}
                  aria-label="Copiar código"
                >
                  {codeCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            <Button
              onClick={handleSuccessModalClose}
              className="w-full bg-[#0f2e22] hover:bg-[#184c37] text-white font-semibold h-11"
            >
              Ver mis productos →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
