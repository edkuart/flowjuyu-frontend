// src/schemas/user-schema.ts

import { z } from "zod";

// ============================================================
// Esquema de registro base (usuarios compradores o generales)
// ============================================================

export const userSchema = z
  .object({
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .trim(),

    correo: z
      .string()
      .email("Correo inválido")
      .transform((v) => v.toLowerCase().trim()),

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

    rol: z.enum(["comprador", "vendedor", "admin"]).default("comprador"),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type UserSchemaValues = z.infer<typeof userSchema>;
