"use client"
import { useState } from "react"

export function useMultiImageUpload(max = 9) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const room = Math.max(0, max - files.length)
    const next = picked.slice(0, room)
    setFiles(f => [...f, ...next])
    next.forEach(f => {
      const url = URL.createObjectURL(f)
      setPreviews(p => [...p, url])
    })
  }
  const removeAt = (idx: number) => {
    setFiles(f => f.filter((_, i) => i !== idx))
    setPreviews(p => p.filter((_, i) => i !== idx))
  }
  return { files, previews, onFilesChange, removeAt }
}
