// src/hooks/useFileUpload.ts
'use client'
import { useState } from 'react'

// Claves soportadas en formularios (ajusta si necesitas más)
export type FileKey = 'logo' | 'dpiFrente' | 'dpiReverso' | 'selfie' | 'registroMercantil'

type FilesMap = Partial<Record<FileKey, File>>
type PreviewsMap = Partial<Record<FileKey, string>>

// ✅ Exportación nombrada y API estable
export function useFileUpload(
  allowed: string[] = ['image/png', 'image/jpeg', 'image/webp'],
  maxSizeMB = 3
) {
  const [files, setFiles] = useState<FilesMap>({})
  const [previews, setPreviews] = useState<PreviewsMap>({})
  const [error, setError] = useState<string | null>(null)

  // Compatibilidad con llamadas existentes
  const archivoAnteriorId: string | null = null
  const eliminarAnterior = (_key?: FileKey) => {}

  function handleFile(e: React.ChangeEvent<HTMLInputElement>, key: FileKey) {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo supera ${maxSizeMB}MB`)
      return
    }
    if (!allowed.includes(f.type)) {
      setError('Formato no permitido. Usa PNG/JPG/WebP')
      return
    }

    setError(null)
    setFiles(prev => ({ ...prev, [key]: f }))
    setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(f) }))
  }

  function clearFile(key?: FileKey) {
    if (!key) {
      setFiles({})
      setPreviews({})
      setError(null)
      return
    }
    setFiles(({ [key]: _omit, ...rest }) => rest as FilesMap)
    setPreviews(({ [key]: _omit, ...rest }) => rest as PreviewsMap)
  }

  return { files, previews, handleFile, clearFile, eliminarAnterior, archivoAnteriorId, error }
}
