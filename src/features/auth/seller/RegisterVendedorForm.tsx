'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerVendedorSchema, RegisterVendedorValues } from '@/schemas/register-vendedor.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function RegisterVendedorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterVendedorValues>({
    resolver: zodResolver(registerVendedorSchema),
    defaultValues: {
      fotoDPIFrente: undefined,
      fotoDPIReverso: undefined,
      selfieConDPI: undefined,
    },
  })

  const [submittedData, setSubmittedData] = useState<RegisterVendedorValues | null>(null)

  const onSubmit = (data: RegisterVendedorValues) => {
    console.log('Datos enviados:', data)
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
        {errors.confirmarPassword && (
          <p className="text-sm text-red-500">{errors.confirmarPassword.message}</p>
        )}
      </div>

      {/* Documento: Foto DPI Frente */}
      <div>
        <Label htmlFor="fotoDPIFrente">Foto DPI (Frente)</Label>
        <Input
          id="fotoDPIFrente"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('fotoDPIFrente', file)
          }}
        />
        {watch('fotoDPIFrente') && (
          <img
            src={URL.createObjectURL(watch('fotoDPIFrente'))}
            alt="Frente DPI"
            className="mt-2 w-32 h-auto rounded"
          />
        )}
        {errors.fotoDPIFrente && (
          <p className="text-sm text-red-500">{errors.fotoDPIFrente.message}</p>
        )}
      </div>

      {/* Documento: Foto DPI Reverso */}
      <div>
        <Label htmlFor="fotoDPIReverso">Foto DPI (Reverso)</Label>
        <Input
          id="fotoDPIReverso"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('fotoDPIReverso', file)
          }}
        />
        {watch('fotoDPIReverso') && (
          <img
            src={URL.createObjectURL(watch('fotoDPIReverso'))}
            alt="Reverso DPI"
            className="mt-2 w-32 h-auto rounded"
          />
        )}
        {errors.fotoDPIReverso && (
          <p className="text-sm text-red-500">{errors.fotoDPIReverso.message}</p>
        )}
      </div>

      {/* Documento: Selfie con DPI */}
      <div>
        <Label htmlFor="selfieConDPI">Selfie con DPI</Label>
        <Input
          id="selfieConDPI"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('selfieConDPI', file)
          }}
        />
        {watch('selfieConDPI') && (
          <img
            src={URL.createObjectURL(watch('selfieConDPI'))}
            alt="Selfie con DPI"
            className="mt-2 w-32 h-auto rounded"
          />
        )}
        {errors.selfieConDPI && (
          <p className="text-sm text-red-500">{errors.selfieConDPI.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Registrarse como Vendedor
      </Button>

      {submittedData && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          Registro exitoso para: <strong>{submittedData.nombre}</strong>
        </div>
      )}
    </form>
  )
}
