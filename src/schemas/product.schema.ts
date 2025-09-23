// src/schemas/product.schema.ts
import { z } from "zod";

export const productSchema = z.object({
  nombre: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no debe superar los 100 caracteres"),

  descripcion: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no debe superar los 1000 caracteres"),

  precio: z
    .string()
    .regex(/^[0-9]+([.,][0-9]{1,2})?$/, "Precio inválido (ej: 10.50)")
    .transform((v) => v.replace(",", ".")),

  stock: z
    .number({ invalid_type_error: "Stock debe ser un número" })
    .int("Stock debe ser entero")
    .nonnegative("Stock no puede ser negativo"),

  activo: z.boolean().default(true),

  // Relaciones
  categoria_id: z.string().optional(),
  clase_id: z.string().optional(),
  tela_id: z.string().optional(),
  region_id: z.string().optional(),

  // Inputs libres (cuando selecciona "Otros")
  categoria_input: z.string().optional(),
  tela_input: z.string().optional(),
  region_input: z.string().optional(),

  // Imágenes (Manuel)
  imagenes: z
    .array(z.any())
    .max(9, "Máximo 9 imágenes")
    .optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;
