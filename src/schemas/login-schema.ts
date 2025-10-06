// src/schemas/login-schema.ts

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Correo inválido' }),
  password: z.string().min(4, { message: 'La contraseña es muy corta' }),
})

export type LoginValues = z.infer<typeof loginSchema>
