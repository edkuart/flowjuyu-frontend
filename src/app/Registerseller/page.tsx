// 📁 src/app/registro-vendedor/page.tsx

import RegisterVendedorForm from '@/features/auth/seller/RegisterVendedorForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registro de Vendedor | Flowjuyu',
  description: 'Crea tu tienda y vende productos auténticos de Guatemala en Flowjuyu',
}

export default function RegistroVendedorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900 px-4 py-8">
      <div className="w-full max-w-2xl">
        <RegisterVendedorForm />
      </div>
    </main>
  )
}

