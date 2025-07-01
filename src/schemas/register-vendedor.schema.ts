import { z } from "zod"

export const registerVendedorSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo inválido"),
  telefono: z
    .string()
    .regex(/^\+502[0-9]{8}$/, "Debe ser un número de Guatemala con +502 y 8 dígitos"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmarPassword: z.string().min(6, "Debes confirmar tu contraseña"),
  dpi: z.string().regex(/^\d{13}$/, "DPI inválido"),
  nombreComercio: z.string().min(1, "El nombre del comercio es obligatorio"),
  nit: z.string().regex(/^\d{8}$|^\d{9}$|^\d{13}$/, "NIT inválido"),
  direccion: z.string().min(1, "La dirección es obligatoria"),
  telefonoComercio: z
    .string()
    .regex(/^\+502[0-9]{8}$/, "Teléfono del comercio inválido"),
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
