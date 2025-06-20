'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerVendedorSchema, RegisterVendedorValues } from '@/schemas/register-vendedor.schema'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { departamentos } from '@/data/departamentos' // crea si no existe: un array con 22 departamentos

export default function RegisterVendedorForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterVendedorValues>({
    resolver: zodResolver(registerVendedorSchema),
  })

  const [submittedData, setSubmittedData] = useState<RegisterVendedorValues | null>(null)

  const onSubmit = (data: RegisterVendedorValues) => {
    console.log('Datos enviados:', data)
    setSubmittedData(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <h2 className="text-xl font-semibold">Datos personales</h2>

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
        <Label htmlFor="telefono">Teléfono personal</Label>
        <Input id="telefono" type="tel" {...register('telefono')} />
        {errors.telefono && <p className="text-sm text-red-500">{errors.telefono.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div>
        <Label htmlFor="dpi">Número de DPI</Label>
        <Input id="dpi" type="text" {...register('dpi')} />
        {errors.dpi && <p className="text-sm text-red-500">{errors.dpi.message}</p>}
      </div>

      <h2 className="text-xl font-semibold mt-6">Datos del comercio</h2>

      <div>
        <Label htmlFor="nombreComercio">Nombre del comercio</Label>
        <Input id="nombreComercio" {...register('nombreComercio')} />
        {errors.nombreComercio && <p className="text-sm text-red-500">{errors.nombreComercio.message}</p>}
      </div>

      <div>
        <Label htmlFor="nit">NIT</Label>
        <Input id="nit" {...register('nit')} />
        {errors.nit && <p className="text-sm text-red-500">{errors.nit.message}</p>}
      </div>

      <div>
        <Label htmlFor="direccion">Dirección del puesto de venta</Label>
        <Input id="direccion" {...register('direccion')} />
        {errors.direccion && <p className="text-sm text-red-500">{errors.direccion.message}</p>}
      </div>

      <div>
        <Label htmlFor="departamento">Departamento</Label>
        <select {...register('departamento')} className="w-full border p-2 rounded">
          <option value="">Selecciona un departamento</option>
          {departamentos.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
        {errors.departamento && <p className="text-sm text-red-500">{errors.departamento.message}</p>}
      </div>

      <div>
        <Label htmlFor="telefonoComercio">Teléfono del comercio</Label>
        <Input id="telefonoComercio" {...register('telefonoComercio')} />
        {errors.telefonoComercio && <p className="text-sm text-red-500">{errors.telefonoComercio.message}</p>}
      </div>

      <div>
        <Label htmlFor="descripcion">Descripción del comercio</Label>
        <Textarea id="descripcion" {...register('descripcion')} />
        {errors.descripcion && <p className="text-sm text-red-500">{errors.descripcion.message}</p>}
      </div>

      <div>
        <Label htmlFor="logo">Foto logotipo del comercio (opcional)</Label>
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('logo', file)
          }}
        />
        {watch('logo') && (
          <img src={URL.createObjectURL(watch('logo'))} alt="Logo" className="mt-2 w-24 rounded" />
        )}
      </div>

      <h2 className="text-xl font-semibold mt-6">Documentación KYC</h2>

      <div>
        <Label htmlFor="fotoDPIFrente">DPI Frente</Label>
        <Input
          id="fotoDPIFrente"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('fotoDPIFrente', file)
          }}
        />
        {watch('fotoDPIFrente') && <img src={URL.createObjectURL(watch('fotoDPIFrente'))} className="mt-2 w-24" />}
      </div>

      <div>
        <Label htmlFor="fotoDPIReverso">DPI Reverso</Label>
        <Input
          id="fotoDPIReverso"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) setValue('fotoDPIReverso', file)
          }}
        />
        {watch('fotoDPIReverso') && <img src={URL.createObjectURL(watch('fotoDPIReverso'))} className="mt-2 w-24" />}
      </div>

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
        {watch('selfieConDPI') && <img src={URL.createObjectURL(watch('selfieConDPI'))} className="mt-2 w-24" />}
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
