import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Contraseña requerida"),
})

export type LoginValues = z.infer<typeof loginSchema>
