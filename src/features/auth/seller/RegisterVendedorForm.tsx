//src/features/auth/seller/RegisterVendedorForm.tsx

"use client";

import { useCallback, useRef, useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  registerVendedorSchema,
  type RegisterVendedorValues,
} from "@/schemas/register-vendedor.schema";
import { departamentosConMunicipios } from "@/data/municipios";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Upload, CheckCircle2 } from "lucide-react";
import { apiRegisterSeller } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import Link from "next/link";

// ── Shared design tokens ──────────────────────────────────────────────────────

const INPUT_CLS =
  "h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all";

const SELECT_CLS =
  "w-full h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#0F3D3A] focus:ring-offset-0 transition-all";

// ── Password field with visibility toggle ─────────────────────────────────────

function PasswordField({
  id,
  label,
  error,
  registration,
}: {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-neutral-700">{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          className={INPUT_CLS}
          {...registration}
        />
        <button
          type="button"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 transition-colors"
          onClick={() => setShow((v) => !v)}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase pt-2">
      {children}
    </p>
  );
}

// ── Styled file picker ────────────────────────────────────────────────────────
// Hides the native file input and exposes a styled button + filename display.
// Uses a forwarded ref so the parent can trigger it programmatically.

function FilePickerField({
  id,
  label,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  file: File | null;
  error?: string;
  onChange: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm text-neutral-700">{label}</Label>

      {/* Hidden native input */}
      <input
        ref={ref}
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) onChange(picked);
        }}
      />

      {/* Styled trigger */}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`
          w-full h-11 flex items-center justify-between gap-2 rounded-xl border px-3 text-sm
          transition-all duration-150 bg-white
          ${file
            ? "border-[#0F3D3A]/40 text-[#0F3D3A]"
            : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600"
          }
        `}
      >
        <span className="flex items-center gap-2 min-w-0">
          {file
            ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F3D3A]" />
            : <Upload className="w-4 h-4 shrink-0" />
          }
          <span className="truncate">
            {file ? file.name : "Seleccionar archivo"}
          </span>
        </span>
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function RegisterVendedorForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedDep, setSelectedDep] = useState("");
  const [municipios,  setMunicipios]  = useState<string[]>([]);
  const [rootError,   setRootError]   = useState<string | null>(null);

  // KYC file state — managed outside Zod (File objects are not serializable)
  const [dpiFrente, setDpiFrente]   = useState<File | null>(null);
  const [dpiReverso, setDpiReverso] = useState<File | null>(null);
  const [selfieDpi, setSelfieDpi]   = useState<File | null>(null);
  const [kycErrors, setKycErrors]   = useState<{
    frente?: string; reverso?: string; selfie?: string;
  }>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterVendedorValues>({
    resolver: zodResolver(registerVendedorSchema),
    defaultValues: {
      acceptedLegalTerms: false,
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterVendedorValues) => {
      setRootError(null);

      // Validate KYC files before sending — they're outside Zod
      const newKycErrors: typeof kycErrors = {};
      if (!dpiFrente)  newKycErrors.frente  = "La foto del DPI (frente) es obligatoria";
      if (!dpiReverso) newKycErrors.reverso = "La foto del DPI (reverso) es obligatoria";
      if (!selfieDpi)  newKycErrors.selfie  = "La selfie con DPI es obligatoria";

      if (Object.keys(newKycErrors).length > 0) {
        setKycErrors(newKycErrors);
        return;
      }
      setKycErrors({});

      const form = new FormData();
      form.append("nombre",           data.nombre);
      form.append("correo",           data.correo);
      form.append("password",         data.password);
      form.append("nombreComercio",   data.nombreComercio);
      form.append("telefonoComercio", data.telefonoComercio);
      form.append("departamento",     data.departamento);
      form.append("municipio",        data.municipio);
      // Deferred text fields
      form.append("telefono",    data.telefono);
      form.append("dpi",         data.dpi);
      form.append("direccion",   data.direccion   ?? "");
      form.append("descripcion", data.descripcion ?? "");
      form.append("accepted_legal_terms", String(data.acceptedLegalTerms));
      // KYC documents (backend field names match upload.middleware.ts)
      form.append("foto_dpi_frente",  dpiFrente!);
      form.append("foto_dpi_reverso", dpiReverso!);
      form.append("selfie_con_dpi",   selfieDpi!);

      const res = await apiRegisterSeller(form);

      if (res.ok && res.user && res.token) {
        if (res.forceLogout) {
          // Backend cleared the refresh cookie — send the user to login so
          // the entry-point flow runs with a clean, validated session.
          router.push("/login");
        } else {
          login(res.user as User, res.token);
          router.push("/seller/my-business");
        }
      } else {
        setRootError(res.message || "Error al registrar el comercio.");
      }
    },
    [router, dpiFrente, dpiReverso, selfieDpi, kycErrors],
  );

  const handleDepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dep = e.target.value;
    setSelectedDep(dep);
    const depObj = departamentosConMunicipios.find((d) => d.nombre === dep);
    setMunicipios(depObj ? depObj.municipios : []);
    setValue("departamento", dep);
    setValue("municipio", "");
  };

  return (
    <AuthLayout
      heading="Crea tu tienda"
      subheading="Empieza en minutos. Completa el perfil completo en tu panel de vendedor."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Personal account ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionLabel>Tu cuenta</SectionLabel>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm text-neutral-700">Nombre completo</Label>
              <Input id="nombre" className={INPUT_CLS} {...register("nombre")} />
              {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="correo" className="text-sm text-neutral-700">Correo electrónico</Label>
              <Input id="correo" type="email" className={INPUT_CLS} {...register("correo")} />
              {errors.correo && <p className="text-xs text-red-500">{errors.correo.message}</p>}
            </div>

            <PasswordField
              id="password"
              label="Contraseña"
              error={errors.password?.message}
              registration={register("password")}
            />

            <PasswordField
              id="confirmarPassword"
              label="Confirmar contraseña"
              error={errors.confirmarPassword?.message}
              registration={register("confirmarPassword")}
            />

            <div className="space-y-1.5">
              <Label htmlFor="telefono" className="text-sm text-neutral-700">Teléfono personal</Label>
              <Input id="telefono" type="tel" placeholder="Ej: 50212345678" className={INPUT_CLS} {...register("telefono")} />
              {errors.telefono
                ? <p className="text-xs text-red-500">{errors.telefono.message}</p>
                : <p className="text-xs text-neutral-400">Necesario para contacto y verificación</p>
              }
            </div>
          </div>
        </div>

        {/* ── Store essentials ───────────────────────────────────────────── */}
        <div className="space-y-4">
          <SectionLabel>Tu negocio</SectionLabel>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nombreComercio" className="text-sm text-neutral-700">Nombre del comercio</Label>
              <Input id="nombreComercio" className={INPUT_CLS} {...register("nombreComercio")} />
              {errors.nombreComercio && <p className="text-xs text-red-500">{errors.nombreComercio.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="telefonoComercio" className="text-sm text-neutral-700">Teléfono del comercio</Label>
              <Input id="telefonoComercio" className={INPUT_CLS} placeholder="00000000" {...register("telefonoComercio")} />
              {errors.telefonoComercio && <p className="text-xs text-red-500">{errors.telefonoComercio.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-neutral-700">Departamento</Label>
              <select
                className={SELECT_CLS}
                value={selectedDep}
                onChange={handleDepChange}
              >
                <option value="">Selecciona</option>
                {departamentosConMunicipios.map((d) => (
                  <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                ))}
              </select>
              {errors.departamento && <p className="text-xs text-red-500">{errors.departamento.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-neutral-700">Municipio</Label>
              <select
                className={SELECT_CLS}
                value={watch("municipio") ?? ""}
                onChange={(e) => setValue("municipio", e.target.value)}
                disabled={!selectedDep}
              >
                <option value="">Selecciona</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.municipio && <p className="text-xs text-red-500">{errors.municipio.message}</p>}
            </div>
          </div>
        </div>

        {/* ── KYC documents ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-4">
          <div>
            <p className="text-[10px] font-semibold tracking-widest text-amber-700 uppercase">
              Documentos de verificación
            </p>
            <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
              Estos documentos son obligatorios para validar tu identidad y proteger a los compradores.
              Aceptamos fotos claras (JPG, PNG, WEBP).
            </p>
          </div>

          {/* DPI number — required by backend for KYC scoring */}
          <div className="space-y-1.5">
            <Label htmlFor="dpi" className="text-sm text-neutral-700">
              Número de DPI
            </Label>
            <Input
              id="dpi"
              type="text"
              placeholder="Ej: 1234 56789 0101"
              className={INPUT_CLS}
              {...register("dpi")}
            />
            {errors.dpi
              ? <p className="text-xs text-red-500">{errors.dpi.message}</p>
              : <p className="text-xs text-amber-700/70">Ingresa el número impreso en tu DPI (no la imagen)</p>
            }
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <FilePickerField
              id="dpi_frente"
              label="DPI — frente"
              file={dpiFrente}
              error={kycErrors.frente}
              onChange={(f) => {
                setDpiFrente(f);
                setKycErrors((prev) => ({ ...prev, frente: undefined }));
              }}
            />
            <FilePickerField
              id="dpi_reverso"
              label="DPI — reverso"
              file={dpiReverso}
              error={kycErrors.reverso}
              onChange={(f) => {
                setDpiReverso(f);
                setKycErrors((prev) => ({ ...prev, reverso: undefined }));
              }}
            />
            <FilePickerField
              id="selfie_dpi"
              label="Selfie con DPI"
              file={selfieDpi}
              error={kycErrors.selfie}
              onChange={(f) => {
                setSelfieDpi(f);
                setKycErrors((prev) => ({ ...prev, selfie: undefined }));
              }}
            />
          </div>
        </div>

        {/* ── Global error ───────────────────────────────────────────────── */}
        {rootError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
            {rootError}
          </div>
        )}

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acceptedLegalTerms"
              checked={watch("acceptedLegalTerms")}
              onCheckedChange={(checked) =>
                setValue("acceptedLegalTerms", checked === true, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              className="mt-0.5 border-neutral-300 data-[state=checked]:border-[#0F3D3A] data-[state=checked]:bg-[#0F3D3A]"
            />
            <div className="space-y-1.5">
              <Label
                htmlFor="acceptedLegalTerms"
                className="text-sm leading-6 text-neutral-700"
              >
                Acepto los{" "}
                <Link
                  href="/legal/terms"
                  className="font-medium text-[#0F3D3A] hover:underline"
                >
                  Términos
                </Link>
                {" "}y la{" "}
                <Link
                  href="/legal/privacy"
                  className="font-medium text-[#0F3D3A] hover:underline"
                >
                  Política de Privacidad
                </Link>
              </Label>
              {errors.acceptedLegalTerms && (
                <p className="text-xs text-red-500">
                  {errors.acceptedLegalTerms.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Submit ─────────────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isSubmitting ? "Creando tu tienda..." : "Crear mi tienda"}
        </Button>

        <p className="text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline transition-colors"
          >
            Inicia sesión
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}
