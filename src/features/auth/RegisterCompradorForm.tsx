"use client"

import { useCallback, useMemo, useState } from "react"
import {
  useForm,
  type FieldValues,
  type Path,
  type UseFormRegister,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import {
  registerVendedorSchema,
  type RegisterVendedorValues,
} from "@/schemas/register-vendedor.schema"
import { departamentosConMunicipios } from "@/data/municipios"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type CampoTexto = {
  id: keyof RegisterVendedorValues
  label: string
  type: string
  pattern?: string
  maxLength?: number
  showTogglePassword?: boolean
}

function Campo<T extends FieldValues>({
  id,
  label,
  register,
  error,
  type = "text",
  pattern,
  maxLength,
  showTogglePassword,
}: {
  id: Path<T>
  label: string
  register: UseFormRegister<T>
  error?: string
  type?: string
  pattern?: string
  maxLength?: number
  showTogglePassword?: boolean
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"
  const isTelefono = id === "telefono" || id === "telefonoComercio"

  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <div className={isTelefono ? "relative" : ""}>
        {isTelefono && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            +502
          </span>
        )}
        <Input
          id={id}
          type={showTogglePassword && isPassword && show ? "text" : type}
          className={isTelefono ? "pl-14 h-12 text-base" : "h-12 text-base"}
          {...register(id, {
            pattern: isTelefono
              ? { value: /^\d{8}$/, message: "Debe ingresar 8 dígitos" }
              : pattern
              ? { value: new RegExp(pattern), message: "Formato inválido" }
              : undefined,
            maxLength: isTelefono ? 8 : maxLength,
            minLength: isTelefono ? 8 : undefined,
            validate: isTelefono
              ? value =>
                  /^\d{8}$/.test(value) ||
                  "El teléfono debe contener exactamente 8 dígitos"
              : undefined,
          })}
          inputMode={isTelefono ? "numeric" : undefined}
          placeholder={isTelefono ? "XXXXXXXX" : showTogglePassword && isPassword ? "Contraseña..." : undefined}
        />
        {showTogglePassword && isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1 text-xs text-muted-foreground border border-gray-200 rounded bg-white"
            tabIndex={-1}
          >
            {show ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

function getPreviewFile(value: unknown): string | undefined {
  if (typeof window === "undefined") return undefined
  if (value instanceof File) {
    return URL.createObjectURL(value)
  }
  return undefined
}

function CampoArchivo<T extends FieldValues>({
  id,
  label,
  register,
  error,
  preview,
  setValue,
}: {
  id: Path<T>
  label: string
  register: UseFormRegister<T>
  error?: string
  preview?: string
  setValue: (id: Path<T>, file: File) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) setValue(id, file)
        }}
      />
      {preview && (
        <img
          src={preview}
          alt={`Previsualización de ${label}`}
          className="mt-2 h-20 rounded object-cover"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

const PERSONAL_FIELDS: CampoTexto[] = [
  { id: "nombre", label: "Nombre completo", type: "text" },
  { id: "email", label: "Correo electrónico", type: "email" },
  {
    id: "telefono",
    label: "Teléfono personal",
    type: "text",
  },
  {
    id: "password",
    label: "Contraseña",
    type: "password",
    showTogglePassword: true,
  },
  {
    id: "confirmarPassword",
    label: "Confirmar contraseña",
    type: "password",
    showTogglePassword: true,
  },
  {
    id: "dpi",
    label: "Número de DPI",
    type: "text",
    pattern: "^\\d{13}$",
    maxLength: 13,
  },
]

const COMERCIO_FIELDS: CampoTexto[] = [
  { id: "nombreComercio", label: "Nombre del comercio", type: "text" },
  {
    id: "nit",
    label: "NIT",
    type: "text",
    pattern: "^\\d{8}$|^\\d{9}$|^\\d{13}$",
  },
  { id: "direccion", label: "Dirección del puesto de venta", type: "text" },
  {
    id: "telefonoComercio",
    label: "Teléfono del comercio",
    type: "text",
  },
]

const FILE_FIELDS: { id: keyof RegisterVendedorValues; label: string }[] = [
  { id: "fotoDPIFrente", label: "Foto DPI (frente)" },
  { id: "fotoDPIReverso", label: "Foto DPI (reverso)" },
  { id: "selfieConDPI", label: "Selfie con DPI" },
]

export default function RegisterVendedorForm() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterVendedorValues>({
    resolver: zodResolver(registerVendedorSchema),
  })

  const [departamento, setDepartamento] = useState("")
  const municipios = useMemo(() => {
    return (
      departamentosConMunicipios.find(d => d.nombre === departamento)?.municipios ?? []
    )
  }, [departamento])

  const onSubmit = useCallback(
    async (data: RegisterVendedorValues) => {
      const form = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        form.append(key, value as string | Blob)
      })
      const res = await fetch("/api/auth/register-vendedor", {
        method: "POST",
        body: form,
      })
      if (res.ok) {
        router.push("/login")
      }
    },
    [router]
  )

  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <Card className="w-full shadow-xl rounded-2xl">
        <CardContent className="p-12 space-y-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* --- Título y subtítulo --- */}
            <header className="text-center space-y-2">
              <h1 className="text-4xl font-bold">Registro de Vendedor</h1>
              <p className="text-muted-foreground text-lg">
                Crea tu cuenta para vender tus productos
              </p>
            </header>

            {/* --- Datos personales --- */}
            <fieldset className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {PERSONAL_FIELDS.map(
                ({ id, label, type, pattern, maxLength, showTogglePassword }) => (
                  <Campo
                    key={id}
                    id={id}
                    label={label}
                    type={type}
                    pattern={pattern}
                    maxLength={maxLength}
                    register={register}
                    showTogglePassword={showTogglePassword}
                    error={errors[id as keyof RegisterVendedorValues]?.message as string}
                  />
                )
              )}
            </fieldset>

            {/* --- Datos del comercio --- */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Datos del comercio</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {COMERCIO_FIELDS.map(({ id, label, type, pattern, maxLength }) => (
                  <Campo
                    key={id}
                    id={id}
                    label={label}
                    type={type}
                    pattern={pattern}
                    maxLength={maxLength}
                    register={register}
                    error={errors[id as keyof RegisterVendedorValues]?.message as string}
                  />
                ))}

                {/* --- Departamento y Municipio dependientes --- */}
                <div className="space-y-1">
                  <Label htmlFor="departamento">Departamento</Label>
                  <select
                    {...register("departamento")}
                    onChange={e => {
                      setDepartamento(e.target.value)
                      setValue("municipio", "")
                    }}
                    className="w-full h-12 border px-3 py-2 rounded text-base"
                  >
                    <option value="">Selecciona un departamento</option>
                    {departamentosConMunicipios.map(dep => (
                      <option key={dep.nombre} value={dep.nombre}>
                        {dep.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && (
                    <p className="text-sm text-red-500">
                      {errors.departamento.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="municipio">Municipio</Label>
                  <select
                    {...register("municipio")}
                    className="w-full h-12 border px-3 py-2 rounded text-base"
                  >
                    <option value="">Selecciona un municipio</option>
                    {municipios.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                  {errors.municipio && (
                    <p className="text-sm text-red-500">
                      {errors.municipio.message}
                    </p>
                  )}
                </div>

                {/* --- Descripción del comercio (col-span 3 para que quede amplia) --- */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="descripcion">Descripción del comercio</Label>
                  <Textarea
                    id="descripcion"
                    {...register("descripcion")}
                    className="h-32 text-base"
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500">
                      {errors.descripcion.message}
                    </p>
                  )}
                </div>

                {/* --- Logo --- */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="logo">Foto logotipo del comercio (opcional)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) setValue("logo", file)
                    }}
                  />
                  {(() => {
                    const logoValue = watch("logo")
                    const preview = getPreviewFile(logoValue)
                    return preview ? (
                      <img src={preview} alt="Logo" className="mt-2 w-24 rounded" />
                    ) : null
                  })()}
                </div>
              </div>
            </div>

            {/* --- Documentos requeridos --- */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Documentos requeridos</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {FILE_FIELDS.map(({ id, label }) => (
                  <CampoArchivo
                    key={id}
                    id={id}
                    label={label}
                    register={register}
                    setValue={setValue}
                    preview={getPreviewFile(watch(id))}
                    error={errors[id as keyof RegisterVendedorValues]?.message as string}
                  />
                ))}
              </div>
            </div>

            {/* --- Botón de enviar --- */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base"
            >
              {isSubmitting ? "Creando cuenta..." : "Registrarse como Vendedor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
