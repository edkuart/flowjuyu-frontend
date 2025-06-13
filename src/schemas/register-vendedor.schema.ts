// src/schemas/register-vendedor.schema.ts
import { z } from 'zod'

export const registerVendedorSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    email: z.string().email('Correo inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmarPassword: z.string().min(6),
    fotoDPIFrente: z.custom<File>((file) => file instanceof File, 'Requerido'),
    fotoDPIReverso: z.custom<File>((file) => file instanceof File, 'Requerido'),
    selfieConDPI: z.custom<File>((file) => file instanceof File, 'Requerido'),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

export type RegisterVendedorValues = z.infer<typeof registerVendedorSchema>