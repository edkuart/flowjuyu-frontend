// src/components/LoginForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginValues } from '@/schemas/login-schema'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const [loginError, setLoginError] = useState<string | null>(null)

  const onSubmit = async (data: LoginValues) => {
    setLoginError(null)

    const res = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
    })

    if (res?.ok) {
      // Verificar rol y redirigir adecuadamente
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      const role = session?.user?.role

      switch (role) {
        case 'admin':
          router.push('/admin/dashboard')
          break
        case 'vendedor':
          router.push('/vendedor/dashboard')
          break
        default:
          router.push('/')
      }
    } else {
      setLoginError('Correo o contraseña incorrectos')
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* FORMULARIO */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
              <p className="text-muted-foreground">Inicia sesión para acceder a tu cuenta</p>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a href="/recuperar-password" className="text-sm underline hover:text-primary">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {loginError && <p className="text-sm text-red-600">{loginError}</p>}

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </div>

            <p className="text-center text-sm">
              ¿No tienes una cuenta?{' '}
              <a href="/register" className="underline underline-offset-4">
                Regístrate
              </a>
            </p>
          </form>

          {/* IMAGEN */}
          <div className="relative hidden md:block bg-muted min-h-[400px]">
            <Image
              src="/cortelogo.png"
              alt="Login cultural"
              fill
              className="object-cover rounded-r-xl"
              priority
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Al continuar, aceptas nuestros{' '}
        <a href="#" className="underline">
          Términos de servicio
        </a>{' '}
        y{' '}
        <a href="#" className="underline">
          Política de privacidad
        </a>
        .
      </p>
    </div>
  )
}