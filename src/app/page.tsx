  'use client'

  import { Button } from '@/components/ui/button'

  export default function HomePage() {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6">
        <section className="max-w-5xl mx-auto text-center py-20 space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            Bienvenido a Cortes Marketplace
          </h1>
          <p className="text-lg text-muted-foreground">
            Compra directamente a productores locales. Productos frescos, sin intermediarios.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="default" size="lg">Explorar productos</Button>
            <Button variant="outline" size="lg">Soy vendedor</Button>
          </div>
        </section>
      </main>
    )
  }
