// Alineado a la BD de tu captura
import { z } from "zod"

export const productSchema = z.object({
  nombre: z.string().min(3, "Mín. 3 caracteres"),
  descripcion: z.string().min(10, "Mín. 10 caracteres"),
  precio_monto: z.number().positive("Debe ser > 0"),
  precio_moneda: z.enum(["Q","USD"]),
  stock: z.number().int().min(0),
  activo: z.boolean().default(true),
  categoria: z.string().min(2),
  tipo_tela: z.string().optional().nullable(),
  calidad_tela: z.string().optional().nullable(),
  origen_departamento: z.string().optional().nullable(),
  origen_municipio: z.string().optional().nullable(),
  etiquetas: z.string().optional().nullable(), // CSV o texto libre
})
export type ProductSchema = z.infer<typeof productSchema>