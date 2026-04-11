// src/schemas/register-vendedor.schema.ts
//
// Simplified seller registration schema — captures only what's needed
// to create the account and a minimal store profile.
//
// Fields moved to post-registration steps:
//   - dpi / KYC documents  → profile completion flow
//   - descripcion          → store customization
//   - direccion personal   → seller profile settings
//   - logo                 → store customization

import { z } from "zod";

export const registerVendedorSchema = z
  .object({
    // ── Personal account ──────────────────────────────────────────────────────

    nombre: z.string().min(1, "El nombre es obligatorio"),

    correo: z.string().email("Correo inválido"),

    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),

    confirmarPassword: z
      .string()
      .min(1, "Debes confirmar tu contraseña"),

    // ── Store essentials ──────────────────────────────────────────────────────

    nombreComercio: z
      .string()
      .min(1, "El nombre del comercio es obligatorio"),

    telefonoComercio: z
      .string()
      .regex(/^\d{8}$/, "Debe tener 8 dígitos"),

    departamento: z
      .string()
      .min(1, "Selecciona un departamento"),

    municipio: z
      .string()
      .min(1, "Selecciona un municipio"),

    // ── Identity ──────────────────────────────────────────────────────────────

    dpi: z
      .string()
      .min(1, "El número de DPI es obligatorio"),

    // ── Contact ───────────────────────────────────────────────────────────────

    telefono: z
      .string()
      .min(8, "El teléfono debe tener al menos 8 dígitos"),

    // ── Deferred fields (submitted as empty, completed post-registration) ─────
    direccion:   z.string().optional(),
    descripcion: z.string().optional(),
    logo:        z.any().optional(),
    acceptedLegalTerms: z
      .boolean()
      .refine((value) => value, {
        message: "Debes aceptar los Términos y la Política de Privacidad",
      }),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

export type RegisterVendedorValues = z.infer<typeof registerVendedorSchema>;
