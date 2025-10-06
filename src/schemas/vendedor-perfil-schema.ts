// src/schemas/vendedor-perfil-schema.ts

import { z } from "zod";

// ============================================================
// Esquema de creación/edición del perfil del vendedor
// ============================================================

export const vendedorPerfilSchema = z.object({
  user_id: z.number({ invalid_type_error: "ID de usuario inválido" }),

  nombre: z.string().min(1, "El nombre es obligatorio"),

  correo: z
    .string()
    .email("Correo inválido")
    .transform((v) => v.toLowerCase().trim()),

  telefono: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "Debe tener 8 dígitos",
    }),

  direccion: z
    .string()
    .min(1, "La dirección es obligatoria")
    .trim(),

  imagen_url: z.any().optional(),

  nombre_comercio: z.string().min(1, "El nombre del comercio es obligatorio"),

  telefono_comercio: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{8}$/.test(val), {
      message: "Debe tener 8 dígitos",
    }),

  departamento: z.string().min(1, "Selecciona un departamento"),

  municipio: z.string().min(1, "Selecciona un municipio"),

  descripcion: z
    .string()
    .min(10, "Describe tu comercio con al menos 10 caracteres"),

  dpi: z.string().regex(/^\d{13}$/, "DPI inválido"),

  foto_dpi_frente: z.any().optional(),
  foto_dpi_reverso: z.any().optional(),
  selfie_con_dpi: z.any().optional(),

  estado: z.enum(["pendiente", "aprobado", "rechazado"]).default("pendiente"),
});

export type VendedorPerfilSchemaValues = z.infer<typeof vendedorPerfilSchema>;
