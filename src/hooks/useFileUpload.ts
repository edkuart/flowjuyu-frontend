//src/hooks/useFileUpload.ts

import { useState } from "react"
import { apiEliminarArchivoAnterior } from "@/services/archivos"
import {
  compressImage,
  MAX_IMAGE_UPLOAD_BYTES,
  MAX_IMAGE_UPLOAD_MB,
} from "@/lib/imageCompression"

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
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      alert(`El archivo supera el tamaño máximo de ${MAX_IMAGE_UPLOAD_MB}MB.`)
      return
    }

    const processedFile = await compressImage(file)

    try {
      await apiEliminarArchivoAnterior(campo, idUsuario)
    } catch (err) {
      console.error("Error al eliminar archivo anterior:", err)
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreviews((prev) => ({ ...prev, [campo]: reader.result as string }))
    }
    reader.readAsDataURL(processedFile)

    setFiles((prev) => ({ ...prev, [campo]: processedFile }))
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
