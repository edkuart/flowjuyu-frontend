// src/app/(auth)/register/page.tsx
import { RegisterForm } from '@/features/auth/RegisterCompradorForm'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-background">
      <RegisterForm />
    </main>
  )
}
