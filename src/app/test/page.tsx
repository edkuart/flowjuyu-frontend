'use client'

import RegisterVendedorForm from '@/features/auth/seller/RegisterVendedorForm'

export default function TestPage() {
  return (
    <main className="min-h-screen p-6 bg-muted">
      <section className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Formulario de Registro de Vendedor</h1>
        <RegisterVendedorForm />
      </section>
    </main>
  )
}
