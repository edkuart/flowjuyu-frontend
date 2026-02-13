//src/hooks/useFileUpload.ts

import { useState } from "react"
import { apiEliminarArchivoAnterior } from "@/services/archivos"

export function useFileUpload() {
  const [previews, setPreviews] = useState<Record<string, string | null>>({})
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [archivoAnteriorId, setArchivoAnteriorId] = useState<Record<string, string>>({})

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    campo: string,
    idUsuario: string
  ) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    // Validaciones de seguridad
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      alert("Solo se permiten imágenes .jpeg, .png, .gif o .webp.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("El archivo supera el tamaño máximo de 2MB.")
      return
    }

    try {
      await apiEliminarArchivoAnterior(campo, idUsuario)
    } catch (err) {
      console.error("Error al eliminar archivo anterior:", err)
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreviews((prev) => ({ ...prev, [campo]: reader.result as string }))
    }
    reader.readAsDataURL(file)

    setFiles((prev) => ({ ...prev, [campo]: file }))
    setArchivoAnteriorId((prev) => ({ ...prev, [campo]: `${idUsuario}-${campo}` }))
  }

  const eliminarAnterior = (campo: string) => {
    setPreviews((prev) => ({ ...prev, [campo]: null }))
    setFiles((prev) => ({ ...prev, [campo]: null }))
    setArchivoAnteriorId((prev) => {
      const nuevo = { ...prev }
      delete nuevo[campo]
      return nuevo
    })
  }

  return { previews, files, handleFile, eliminarAnterior, archivoAnteriorId }
}
