'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerCompradorSchema, RegisterCompradorValues } from '@/schemas/register-comprador.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

export default function RegisterCompradorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCompradorValues>({
    resolver: zodResolver(registerCompradorSchema),
  })

  const [submittedData, setSubmittedData] = useState<RegisterCompradorValues | null>(null)

  const onSubmit = (data: RegisterCompradorValues) => {
    console.log('Formulario válido:', data)
    setSubmittedData(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div>
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" {...register('nombre')} />
        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
        <Input id="confirmarPassword" type="password" {...register('confirmarPassword')} />
        {errors.confirmarPassword && <p className="text-sm text-red-500">{errors.confirmarPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full">
        Registrarse
      </Button>

      {submittedData && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Registro exitoso para: <strong>{submittedData.nombre}</strong>
        </div>
      )}
    </form>
  )
}
