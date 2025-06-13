'use client'

import RegisterVendedorForm from '@/features/auth/seller/RegisterVendedorForm'

export default function TestPage() {
  return (
    <div className="min-h-screen p-8 bg-zinc-100 text-black">
      <h1 className="text-2xl font-bold mb-6">Registro de Vendedor</h1>
      <RegisterVendedorForm />
    </div>
  )
}
