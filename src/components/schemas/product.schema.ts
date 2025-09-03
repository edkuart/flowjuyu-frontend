import { z } from "zod"

export const productSchema = z.object({
  titulo: z.string().min(3, "El título es obligatorio"),
  descripcion: z.string().min(10, "La descripción es obligatoria"),
  precio: z.number().positive("Debe ser mayor a cero"),
  stock: z.number().int().nonnegative("Debe ser cero o mayor"),
  categoria_principal: z.string().min(1, "Debe elegir una categoría"),
  subcategorias: z.array(z.string()).min(1, "Seleccione al menos una subcategoría"),
  tipo_tela: z.string().optional(),
  origen_producto: z.string().optional(),
})

export type ProductSchema = z.infer<typeof productSchema>