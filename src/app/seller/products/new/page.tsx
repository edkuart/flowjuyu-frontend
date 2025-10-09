'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Move, Star, Loader2 } from 'lucide-react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'

const categoriasTipicas = [
  'Blusas típicas',
  'Fajas artesanales',
  'Trajes regionales',
  'Bolsas tejidas',
  'Máscaras ceremoniales',
  'Ponchos mayas'
]

type ImgItem = {
  file: File
  preview: string
  isCover?: boolean
}

const MAX_IMAGES = 9
const MAX_IMAGE_MB = 3
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export default function AddProductPage() {
  const [activo, setActivo] = useState(true)
  const [moneda, setMoneda] = useState<'Q' | 'USD'>('Q')

  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [sku, setSku] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [stock, setStock] = useState<number | ''>('')
  const [categoria, setCategoria] = useState('')
  const [tags, setTags] = useState('')

  const [imagenes, setImagenes] = useState<ImgItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalSizeMb = (imagenes.reduce((a, i) => a + i.file.size, 0) / (1024 * 1024)).toFixed(2)
  const imgCount = imagenes.length

  const formatMoney = (value: string) => {
    if (!value) return ''
    const n = Number(value)
    if (Number.isNaN(n)) return ''
    return n.toFixed(2)
  }
  const onPrecioBlur = () => setPrecio(formatMoney(precio))

  // manejo de imágenes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_IMAGES - imagenes.length
    const selected = files.slice(0, remaining)

    const problems: string[] = []
    const next: ImgItem[] = []

    selected.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        problems.push(`Tipo no permitido: ${file.name}`)
        return
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        problems.push(`Archivo muy grande (> ${MAX_IMAGE_MB}MB): ${file.name}`)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        next.push({ file, preview: reader.result as string })
        if (next.length === selected.length - problems.length) {
          setImagenes((prev) => {
            const merged = [...prev, ...next]
            if (merged.length && !merged.some(i => i.isCover)) {
              merged[0].isCover = true
            }
            return merged
          })
        }
      }
      reader.readAsDataURL(file)
    })

    if (problems.length) alert(problems.join('\n'))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const setAsCover = (idx: number) => {
    setImagenes((prev) => {
      const arr = prev.map((i, j) => ({ ...i, isCover: j === idx }))
      const cover = arr[idx]
      const rest = arr.filter((_, j) => j !== idx)
      return [cover, ...rest]
    })
  }

  const handleRemoveImage = (index: number) => {
    setImagenes((prev) => {
      const removed = prev.filter((_, i) => i !== index)
      if (removed.length && !removed.some(i => i.isCover)) removed[0].isCover = true
      return removed
    })
  }

  const moveImage = (from: number, to: number) => {
    setImagenes((prev) => {
      const arr = [...prev]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      const coverIdx = arr.findIndex(i => i.isCover)
      if (coverIdx > 0) {
        const [cover] = arr.splice(coverIdx, 1)
        arr.unshift(cover)
      }
      return arr
    })
  }

  const DraggableImage = ({ item, index }: { item: ImgItem; index: number }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [, drop] = useDrop({
      accept: 'image',
      hover: (dragItem: { index: number }) => {
        if (!ref.current) return
        if (dragItem.index !== index && index !== 0) {
          moveImage(dragItem.index, index)
          dragItem.index = index
        }
      },
    })
    const [, drag] = useDrag({
      type: 'image',
      item: { index },
      canDrag: () => index !== 0,
    })
    drag(drop(ref))

    return (
      <div ref={ref} className="relative">
        <Image src={item.preview} alt={`Vista previa ${index + 1}`} width={220} height={220} className="rounded-md border object-cover aspect-square" />
        <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-black/80">
          <X className="w-4 h-4" />
        </button>
        {index === 0 && item.isCover ? (
          <div className="absolute bottom-1 left-1 bg-green-600 text-white rounded-full px-2 py-0.5 text-[11px] font-medium">Portada</div>
        ) : (
          <div className="absolute bottom-1 left-1 flex gap-1">
            <button type="button" onClick={() => setAsCover(index)} className="bg-black/70 text-white rounded-full p-1 hover:bg-black/80" title="Marcar como portada">
              <Star className="w-4 h-4" />
            </button>
            <div className="bg-black/70 text-white rounded-full p-1" title="Arrastra para reordenar">
              <Move className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    )
  }

  // submit
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOkMsg(null)

    if (!nombre.trim()) return setError('El nombre es obligatorio.')
    if (!precio || Number(precio) <= 0) return setError('Ingresa un precio válido.')
    if (!categoria) return setError('Selecciona una categoría.')
    if (!descripcion.trim()) return setError('La descripción es obligatoria.')
    if (!imagenes.length) return setError('Debes subir al menos una imagen.')
    if (Number(totalSizeMb) > 40) return setError('Las imágenes superan 40MB totales.')

    try {
      setSubmitting(true)
      const fd = new FormData()
      fd.append('nombre', nombre.trim())
      fd.append('precio', formatMoney(precio))
      fd.append('moneda', moneda)
      fd.append('sku', sku.trim())
      fd.append('descripcion', descripcion.trim())
      fd.append('stock', String(stock || 0))
      fd.append('categoria', categoria)
      fd.append('activo', String(activo))
      fd.append('tags', tags)

      imagenes.forEach((it, idx) => {
        fd.append('imagenes', it.file, it.file.name)
        if (it.isCover) fd.append('coverIndex', String(idx))
      })

      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/products`
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        body: fd,
      })

      if (!res.ok) throw new Error(await res.text().catch(() => 'No se pudo guardar el producto'))

      setOkMsg('Producto guardado correctamente ✅')
      setNombre(''); setPrecio(''); setSku(''); setDescripcion(''); setStock(''); setCategoria(''); setTags('')
      setImagenes([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setError(err?.message || 'Error al guardar el producto')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', '.']
    if (!/\d/.test(e.key) && !allowed.includes(e.key)) e.preventDefault()
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Agregar nuevo producto</h1>
          <p className="text-sm text-muted-foreground">Completa los campos para publicar un nuevo producto en tu tienda.</p>
        </header>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre del producto</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Ej. Blusa roja bordada a mano" />
              </div>
              <div>
                <Label htmlFor="sku">SKU (opcional)</Label>
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Ej. BLU-ROJ-001" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Precio</Label>
                <div className="flex gap-2 items-center">
                  <select value={moneda} onChange={(e) => setMoneda(e.target.value as 'Q' | 'USD')} className="border rounded-md px-2 py-1 text-sm">
                    <option value="Q">Q</option>
                    <option value="USD">USD</option>
                  </select>
                  <Input inputMode="decimal" pattern="^\d+(\.\d{1,2})?$" placeholder="0.00" className="appearance-none" onKeyDown={handlePrecioKeyDown} onBlur={onPrecioBlur} value={precio} onChange={(e) => setPrecio(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label htmlFor="stock">Stock disponible</Label>
                <Input id="stock" type="number" min={0} required value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" rows={4} required value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <select id="categoria" required value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm text-neutral-900">
                <option value="">Seleccione una opción</option>
                {categoriasTipicas.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por coma)</Label>
              <Input id="tags" placeholder="blusa, roja, bordado" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="activo" className="flex-1">Producto activo</Label>
              <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="mb-1 block">Imágenes del producto (máximo {MAX_IMAGES})</Label>
              <div className="text-xs text-muted-foreground">{imgCount}/{MAX_IMAGES} • {totalSizeMb} MB</div>
            </div>
            <Input ref={fileInputRef} type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={handleImageChange} />
            {imagenes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {imagenes.map((it, idx) => <DraggableImage key={idx} item={it} index={idx} />)}
              </div>
            )}
          </Card>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded-md">{error}</div>}
          {okMsg && <div className="text-sm text-green-700 bg-green-50 border border-green-200 p-2 rounded-md">{okMsg}</div>}

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando…</>) : 'Guardar producto'}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setNombre(''); setPrecio(''); setSku(''); setDescripcion(''); setStock(''); setCategoria(''); setTags(''); setImagenes([]); if (fileInputRef.current) fileInputRef.current.value = ''; setError(null); setOkMsg(null) }}>Limpiar</Button>
          </div>
        </form>
      </main>
    </DndProvider>
  )
}
