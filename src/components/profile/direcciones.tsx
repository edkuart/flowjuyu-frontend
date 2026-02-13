// src/components/profile/direcciones.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, XCircle } from 'lucide-react'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect('/login')
  }

  const dummyFechaRegistro = '12 de enero de 2024'
  const correoVerificado = true

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
                <AvatarImage src="/avatar-placeholder.png" alt={session.user.name || 'Usuario'} />
                <AvatarFallback>{session.user.name?.[0] ?? '?'}</AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">{session.user.name}</h2>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>

              <label htmlFor="avatar-upload" className="mt-4">
                <input id="avatar-upload" type="file" accept="image/*" hidden />
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" /> Subir nueva foto
                </Button>
              </label>

              <p className="mt-6 text-xs text-muted-foreground">
                Miembro desde el {dummyFechaRegistro}
              </p>
            </div>

            <form className="space-y-6 text-sm text-neutral-700">
              <input type="hidden" value={session.user.id} name="userId" />
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" defaultValue={session.user.name || ''} type="text" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Correo</Label>
                  <div className="relative">
                    <Input id="email" defaultValue={session.user.email || ''} type="email" disabled className="mt-1 pr-10 bg-muted/30" />
                    <span className="absolute right-2 top-[50%] -translate-y-1/2">
                      {correoVerificado ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" placeholder="Ej: +502 5555 5555" type="tel" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input id="direccion" placeholder="Ciudad, zona, calle..." className="mt-1" />
                </div>
              </div>
              <Button className="w-full mt-4">Guardar cambios</Button>
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
