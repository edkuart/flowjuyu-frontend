import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Plus, MapPin, Trash2 } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DireccionesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return redirect('/login')
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:py-16">
      <section className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Direcciones</h1>
          <p className="text-muted-foreground mt-2">Gestiona tus direcciones de envío</p>
        </div>

        <Card className="border-muted/40">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold">Nueva dirección</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departamento">Departamento</Label>
                <Input id="departamento" placeholder="Ej. Quetzaltenango" />
              </div>
              <div>
                <Label htmlFor="municipio">Municipio</Label>
                <Input id="municipio" placeholder="Ej. La Esperanza" />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="direccion">Dirección exacta</Label>
                <Input id="direccion" placeholder="Calle, zona, referencia..." />
              </div>
              <div className="md:col-span-2 text-right">
                <Button type="submit" className="gap-2">
                  <Plus className="w-4 h-4" /> Agregar dirección
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Direcciones registradas</h2>
          <Card>
            <CardContent className="flex items-start justify-between gap-6 p-5">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 mt-1 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">Zona 3, La Esperanza, Quetzaltenango</p>
                  <p className="text-sm text-muted-foreground">Referencia: a 2 cuadras del parque central</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="w-5 h-5 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
