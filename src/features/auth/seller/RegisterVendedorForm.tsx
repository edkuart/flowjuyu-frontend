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
import { departamentosConMunicipios, type Departamento } from "@/data/municipios"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Eye, EyeOff } from "lucide-react" // o usa tus propios íconos svg

type CampoTexto = {
  id: keyof RegisterVendedorValues
  label: string
  type: string
  pattern?: string
  maxLength?: number
  showTogglePassword?: boolean
}

const PERSONAL_FIELDS: CampoTexto[] = [
  { id: "nombre", label: "Nombre completo", type: "text" },
  { id: "email", label: "Correo electrónico", type: "email" },
  { id: "telefono", label: "Teléfono personal", type: "text" },
  {
    id: "password",
    label: "Contraseña",
    type: "password",
    showTogglePassword: true
  },
  {
    id: "confirmarPassword",
    label: "Confirmar contraseña",
    type: "password",
    showTogglePassword: true
  },
  {
    id: "dpi",
    label: "Número de DPI",
    type: "text",
    pattern: "^\\d{13}$",
    maxLength: 13
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
    type: "text"
  },
]

const FILE_FIELDS: { id: keyof RegisterVendedorValues; label: string }[] = [
  { id: "fotoDPIFrente", label: "Foto DPI (frente)" },
  { id: "fotoDPIReverso", label: "Foto DPI (reverso)" },
  { id: "selfieConDPI", label: "Selfie con DPI" },
]

function Campo<T extends FieldValues>({
  id,
  label,
  register,
  error,
  type = "text",
  pattern,
  maxLength,
  showTogglePassword,
  value,
  setValue,
}: {
  id: Path<T>
  label: string
  register: UseFormRegister<T>
  error?: string
  type?: string
  pattern?: string
  maxLength?: number
  showTogglePassword?: boolean
  value?: string
  setValue?: (id: Path<T>, value: string) => void
}) {
  const [show, setShow] = useState(false)

  // Teléfonos guatemala, +502 fijo
  if (id === "telefono" || id === "telefonoComercio") {
    return (
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center">
          <span className="inline-block px-2 py-2 border rounded-l bg-muted select-none">+502</span>
          <Input
            id={id}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            className="h-12 text-base rounded-l-none"
            {...register(id, {
              required: true,
              pattern: {
                value: /^\d{8}$/,
                message: "El teléfono debe tener 8 dígitos"
              },
              maxLength: { value: 8, message: "Máximo 8 dígitos" }
            })}
            placeholder="12345678"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // Campo con toggle password
  if (showTogglePassword) {
    return (
      <div className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            type={show ? "text" : "password"}
            autoComplete={id === "password" ? "new-password" : "off"}
            className="h-12 text-base pr-10"
            {...register(id)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500 hover:text-zinc-800"
            tabIndex={-1}
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // Otros campos
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        pattern={pattern}
        maxLength={maxLength}
        className="h-12 text-base"
        {...register(id)}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
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
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setValue(id, file)
        }}
      />
      {preview && (
        <img
          src={preview}
          alt={label}
          className="mt-2 h-20 rounded object-cover"
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function RegisterVendedorForm() {
  const router = useRouter()
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("")
  const [municipios, setMunicipios] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<RegisterVendedorValues>({
    resolver: zodResolver(registerVendedorSchema),
  })

  const onSubmit = useCallback(
    async (data: RegisterVendedorValues) => {
      const form = new FormData()
      Object.entries(data).forEach(([k, v]) => form.append(k, v as any))
      // TODO: Cambiar endpoint a tu backend real
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

  // Manejo municipios
  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dep = e.target.value
    setSelectedDepartamento(dep)
    const depObj = departamentosConMunicipios.find((d) => d.nombre === dep)
    setMunicipios(depObj ? depObj.municipios : [])
    setValue("departamento", dep)
    setValue("municipio", "")
  }

  return (
    <section className="w-full max-w-screen-xl mx-auto px-4 py-8">
      <Card className="w-full shadow-xl rounded-2xl">
        <CardContent className="p-12 space-y-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <header className="text-center space-y-2">
              <h1 className="text-4xl font-bold">Registro de Vendedor</h1>
              <p className="text-muted-foreground text-lg">
                Crea tu cuenta para vender tus productos
              </p>
            </header>

            {/* Datos personales */}
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

            {/* Datos del comercio */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Datos del comercio</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {COMERCIO_FIELDS.map(
                  ({ id, label, type, pattern, maxLength }) => (
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
                  )
                )}

                {/* Departamento */}
                <div>
                  <Label htmlFor="departamento">Departamento</Label>
                  <select
                    {...register("departamento")}
                    className="w-full h-12 border px-3 py-2 rounded text-base"
                    value={selectedDepartamento}
                    onChange={handleDepartamentoChange}
                  >
                    <option value="">Selecciona un departamento</option>
                    {departamentosConMunicipios.map((d) => (
                      <option key={d.nombre} value={d.nombre}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && (
                    <p className="text-sm text-red-500">
                      {errors.departamento.message}
                    </p>
                  )}
                </div>

                {/* Municipio */}
                <div>
                  <Label htmlFor="municipio">Municipio</Label>
                  <select
                    {...register("municipio")}
                    className="w-full h-12 border px-3 py-2 rounded text-base"
                    value={watch("municipio")}
                    onChange={(e) => setValue("municipio", e.target.value)}
                  >
                    <option value="">Selecciona un municipio</option>
                    {municipios.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {errors.municipio && (
                    <p className="text-sm text-red-500">
                      {errors.municipio.message}
                    </p>
                  )}
                </div>

                {/* Logo */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="logo">Foto logotipo del comercio (opcional)</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setValue("logo", file)
                    }}
                  />
                  {watch("logo") && (
                    <img
                      src={URL.createObjectURL(watch("logo"))}
                      alt="Logo"
                      className="mt-2 w-24 rounded"
                    />
                  )}
                </div>

                {/* Descripción */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="descripcion">Descripción del comercio</Label>
                  <Textarea
                    id="descripcion"
                    className="h-28 text-base"
                    {...register("descripcion")}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500">
                      {errors.descripcion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Archivos requeridos */}
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
                    preview={
                      watch(id) && watch(id) instanceof File
                        ? URL.createObjectURL(watch(id) as File)
                        : undefined
                    }
                    error={errors[id]?.message as string | undefined}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
              {isSubmitting ? "Creando cuenta…" : "Registrarse como Vendedor"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
