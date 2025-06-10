'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterValues } from '@/schemas/register-schema'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function RegisterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterValues) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" {...register("nombre")} />
        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
        <Input id="confirmarPassword" type="password" {...register("confirmarPassword")} />
        {errors.confirmarPassword && <p className="text-sm text-red-500">{errors.confirmarPassword.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Crear cuenta
      </Button>
    </form>
  )
}
