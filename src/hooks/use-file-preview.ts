import { useEffect, useState } from 'react'

export function useFilePreview(file?: File | null) {
  const [url, setUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!file) {
      setUrl(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  return url
}
