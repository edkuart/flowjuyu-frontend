'use client'

import RegisterCompradorForm from '@/features/auth/RegisterCompradorForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold text-center mb-4">Registro de Comprador</h1>
        <RegisterCompradorForm />
      </div>
    </main>
  )
}
