"use client"

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Move } from 'lucide-react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const categoriasTipicas = [
  'Blusas típicas',
  'Fajas artesanales',
  'Trajes regionales',
  'Bolsas tejidas',
  'Máscaras ceremoniales',
  'Ponchos mayas'
]

export default function AddProductPage() {
  const [activo, setActivo] = useState(true)
  const [imagenes, setImagenes] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [moneda, setMoneda] = useState<'Q' | 'USD'>('Q')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const selected = files.slice(0, 9 - imagenes.length)

    if (selected.length + imagenes.length > 9) {
      alert('Máximo 9 imágenes permitidas')
    }

    setImagenes((prev) => [...prev, ...selected])

    selected.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (from: number, to: number) => {
    const newPreviews = [...previews]
    const newImagenes = [...imagenes]
    const [movedPreview] = newPreviews.splice(from, 1)
    const [movedImage] = newImagenes.splice(from, 1)
    newPreviews.splice(to, 0, movedPreview)
    newImagenes.splice(to, 0, movedImage)
    setPreviews(newPreviews)
    setImagenes(newImagenes)
  }

  const DraggableImage = ({ src, index }: { src: string; index: number }) => {
    const ref = useRef<HTMLDivElement>(null)

    const [, drop] = useDrop({
      accept: 'image',
      hover: (item: { index: number }) => {
        if (item.index !== index) {
          moveImage(item.index, index)
          item.index = index
        }
      },
    })

    const [, drag] = useDrag({
      type: 'image',
      item: { index },
    })

    drag(drop(ref))

    return (
      <div ref={ref} className="relative">
        <Image
          src={src}
          alt={`Vista previa ${index + 1}`}
          width={200}
          height={200}
          className="rounded-md border object-cover"
        />
        <button
          type="button"
          onClick={() => handleRemoveImage(index)}
          className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white rounded-full p-1">
          <Move className="w-4 h-4" />
        </div>
      </div>
    )
  }

  const handlePrecioKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "."]
    if (!/\d/.test(e.key) && !allowed.includes(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">Agregar nuevo producto</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Completa los campos para publicar un nuevo producto en tu tienda.
          </p>
        </header>

        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del producto</Label>
              <Input id="nombre" name="nombre" required placeholder="Ej. Blusa roja bordada a mano" />
            </div>

            <div>
              <Label htmlFor="precio">Precio</Label>
              <div className="flex gap-2 items-center">
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value as 'Q' | 'USD')}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  <option value="Q">Q</option>
                  <option value="USD">USD</option>
                </select>
                <Input
                  id="precio"
                  name="precio"
                  required
                  inputMode="decimal"
                  pattern="^\d+(\.\d{1,2})?$"
                  placeholder="0.00"
                  className="appearance-none"
                  onKeyDown={handlePrecioKeyDown}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" rows={4} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock disponible</Label>
              <Input id="stock" name="stock" type="number" required min={0} />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <select
                id="categoria"
                name="categoria"
                required
                className="w-full border rounded-md px-3 py-2 text-sm text-neutral-900"
              >
                <option value="">Seleccione una opción</option>
                {categoriasTipicas.map((categoria) => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="activo">Producto activo</Label>
            <Switch id="activo" checked={activo} onCheckedChange={setActivo} />
          </div>

          <div className="space-y-2">
            <Label className="mb-1 block">Imágenes del producto (máximo 9)</Label>
            <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                {previews.map((src, index) => (
                  <DraggableImage key={index} src={src} index={index} />
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full sm:w-auto">Guardar producto</Button>
        </form>
      </main>
    </DndProvider>
  )
}
