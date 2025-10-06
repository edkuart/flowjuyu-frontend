// src/schemas/register-comprador.schema.ts

import { z } from "zod";

export const registerCompradorSchema = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .trim(),
    email: z
      .string()
      .email("Correo inválido")
      .trim(),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmarPassword: z.string(),
    telefono: z
      .string()
      .optional()
      .refine((val) => !val || /^\d{8}$/.test(val), {
        message: "El teléfono debe tener exactamente 8 dígitos",
      }),
    direccion: z
      .string()
      .optional()
      .transform((val) => (val?.trim() === "" ? undefined : val?.trim())),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type RegisterCompradorValues = z.infer<typeof registerCompradorSchema>;
