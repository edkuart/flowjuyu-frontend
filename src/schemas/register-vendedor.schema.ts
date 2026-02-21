// src/schemas/register-vendedor.schema.ts

import { z } from "zod"

export const registerVendedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),

  // 🔥 CAMBIADO: email → correo
  correo: z.string().email("Correo inválido"),

  telefono: z.string().regex(/^\d{8}$/, "Debe tener 8 dígitos"),

  // 🔥 Consistente con backend
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),

  confirmarPassword: z.string().min(8, "Debes confirmar tu contraseña"),

  dpi: z.string().regex(/^\d{13}$/, "DPI inválido"),

  nombreComercio: z.string().min(1, "El nombre del comercio es obligatorio"),

  direccion: z.string().min(1, "La dirección es obligatoria"),

  telefonoComercio: z.string().regex(/^\d{8}$/, "Debe tener 8 dígitos"),

  departamento: z.string().min(1, "Selecciona un departamento"),

  municipio: z.string().min(1, "Selecciona un municipio"),

  descripcion: z.string().min(1, "Describe tu comercio"),

  logo: z.any().optional(),

  fotoDPIFrente: z.any(),
  fotoDPIReverso: z.any(),
  selfieConDPI: z.any(),

}).refine((data) => data.password === data.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
})

export type RegisterVendedorValues = z.infer<typeof registerVendedorSchema>