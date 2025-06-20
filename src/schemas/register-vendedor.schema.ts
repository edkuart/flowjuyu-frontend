// src/schemas/register-vendedor.schema.ts
import { z } from 'zod'

export const registerVendedorSchema = z
  .object({
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    email: z.string().email('Correo inválido'),
    telefono: z.string().min(8, 'Teléfono inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmarPassword: z.string().min(6, 'Confirmación requerida'),
    dpi: z.string().regex(/^\d{13}$/, 'DPI debe tener 13 dígitos'),


    // Datos del comercio
    nombreComercio: z.string().min(2, 'Nombre del comercio obligatorio'),
    nit: z.string().regex(/^\d{7}-\d$/, 'Formato de NIT inválido'),
    direccion: z.string().min(5),
    departamento: z.string().min(3),
    telefonoComercio: z.string().optional(),
    descripcion: z.string().min(10),
    logo: z.any().optional(),

    // Documentos KYC
    fotoDPIFrente: z.custom<File>((file) => file instanceof File, 'Requerido'),
    fotoDPIReverso: z.custom<File>((file) => file instanceof File, 'Requerido'),
    selfieConDPI: z.custom<File>((file) => file instanceof File, 'Requerido'),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  })

export type RegisterVendedorValues = z.infer<typeof registerVendedorSchema>
