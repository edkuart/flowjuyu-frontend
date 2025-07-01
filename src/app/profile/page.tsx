'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { data: session, status } = useSession()

  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [direccion, setDireccion] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user) {
      setNombre(session.user.name || '')
      setTelefono('')
      setDireccion('')
    }
  }, [session])

  const validarTelefono = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '')
    if (soloNumeros.length <= 8) setTelefono(soloNumeros)
  }

  if (status === 'loading' || !session) return null

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:py-16">
      <section className="max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900">Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona tu cuenta, consulta y edita tus datos personales, direcciones y pedidos.
          </p>
        </div>

        <Card className="rounded-2xl shadow-sm border border-muted/40">
          <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-28 h-28">
                <AvatarImage
                  src={imagen || 'https://ui-avatars.com/api/?name=Usuario&background=random'}
                  alt="Foto de perfil"
                  style={{ width: 'auto', height: 'auto' }}
                />
                <AvatarFallback>{nombre[0] ?? 'U'}</AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-lg font-semibold text-neutral-900">{nombre}</h2>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>

              <label htmlFor="avatar-upload" className="mt-4">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = () => setImagen(reader.result as string)
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" /> Subir nueva foto
                </Button>
              </label>

              <p className="mt-6 text-xs text-muted-foreground">
                Miembro desde el 12 de enero de 2024
              </p>
            </div>

            <form className="space-y-6 text-sm text-neutral-700" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={!editando}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={session.user.email || ''}
                      disabled
                      className="mt-1 pr-10 bg-muted/30"
                    />
                    <span className="absolute right-2 top-[50%] -translate-y-1/2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">+502</span>
                    <Input
                      id="telefono"
                      value={telefono}
                      onChange={(e) => validarTelefono(e.target.value)}
                      disabled={!editando}
                      className="w-32"
                      placeholder="Ej: 55556666"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    disabled={!editando}
                    className="mt-1"
                    placeholder="Ciudad, zona, calle."
                  />
                </div>
              </div>

              {editando ? (
                <Button className="w-full mt-4" type="submit">
                  Guardar cambios
                </Button>
              ) : (
                <Button
                  className="w-full mt-4"
                  type="button"
                  onClick={() => setEditando(true)}
                >
                  Editar datos
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile/direcciones">
            <Card className="hover:shadow-md transition">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Direcciones</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Administra tus direcciones de envío.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/historial">
            <Card className="hover:shadow-md transition">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Historial</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Consulta tus pedidos anteriores.
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/profile/favoritos">
            <Card className="hover:shadow-md transition">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">Favoritos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Accede a tu lista de deseos.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </main>
  )
}
