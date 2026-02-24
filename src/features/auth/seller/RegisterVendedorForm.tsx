//src/features/auth/seller/RegisterVendedorForm.tsx

"use client"

import { useCallback, useState } from "react"
import {
  useForm,
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
import { useFileUpload } from "@/hooks/useFileUpload"
import { Eye, EyeOff } from "lucide-react"
import { apiRegisterSeller } from "@/services/auth"

function CampoTexto({
  id,
  label,
  register,
  error,
  type = "text",
  showTogglePassword,
}: {
  id: Path<RegisterVendedorValues>
  label: string
  register: UseFormRegister<RegisterVendedorValues>
  error?: string
  type?: string
  showTogglePassword?: boolean
}) {
  const [show, setShow] = useState(false)

  if (showTogglePassword) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          <Input
            id={id}
            type={show ? "text" : "password"}
            className="h-12"
            {...register(id)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-500"
            onClick={() => setShow(v => !v)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} className="h-12" {...register(id)} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function RegisterVendedorForm() {
  const router = useRouter()
  const [selectedDepartamento, setSelectedDepartamento] = useState("")
  const [municipios, setMunicipios] = useState<string[]>([])
  const { previews, files, handleFile } = useFileUpload()

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

      // 🔥 Agregar solo campos de texto manualmente
      form.append("nombre", data.nombre)
      form.append("correo", data.correo)
      form.append("telefono", data.telefono)
      form.append("password", data.password)
      form.append("dpi", data.dpi)
      form.append("nombreComercio", data.nombreComercio)
      form.append("direccion", data.direccion)
      form.append("telefonoComercio", data.telefonoComercio)
      form.append("departamento", data.departamento)
      form.append("municipio", data.municipio)
      form.append("descripcion", data.descripcion)

      // 🔥 Archivos en snake_case
      if (files.logo) form.append("logo", files.logo)
      if (files.fotoDPIFrente)
        form.append("foto_dpi_frente", files.fotoDPIFrente)
      if (files.fotoDPIReverso)
        form.append("foto_dpi_reverso", files.fotoDPIReverso)
      if (files.selfieConDPI)
        form.append("selfie_con_dpi", files.selfieConDPI)

      const res = await apiRegisterSeller(form)

      if (res.ok) router.push("/login")
    },
    [router, files]
  )

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dep = e.target.value
    setSelectedDepartamento(dep)
    const depObj = departamentosConMunicipios.find((d) => d.nombre === dep)
    setMunicipios(depObj ? depObj.municipios : [])
    setValue("departamento", dep)
    setValue("municipio", "")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">

      {/* HEADER */}
      <header className="space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">
          Registro de Vendedor
        </h2>
        <p className="text-neutral-600 max-w-2xl">
          Completa la información para validar tu comercio. 
          Todos los datos serán revisados por el equipo de Flowjuyu antes de aprobar tu cuenta.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">

        {/* ================= INFORMACIÓN PERSONAL ================= */}
        <section className="bg-white border rounded-2xl p-8 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-semibold">
              Información personal
            </h3>
            <p className="text-sm text-neutral-500">
              Datos del titular responsable del comercio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <CampoTexto id="nombre" label="Nombre completo" register={register} error={errors.nombre?.message} />
            <CampoTexto
              id="correo"
              label="Correo electrónico"
              register={register}
              error={errors.correo?.message}
              type="email"
            />
            <CampoTexto id="telefono" label="Teléfono personal" register={register} error={errors.telefono?.message} />
            <CampoTexto id="password" label="Contraseña" register={register} error={errors.password?.message} showTogglePassword />
            <CampoTexto id="confirmarPassword" label="Confirmar contraseña" register={register} error={errors.confirmarPassword?.message} showTogglePassword />
            <CampoTexto id="dpi" label="Número de DPI (13 dígitos)" register={register} error={errors.dpi?.message} />
          </div>
        </section>

        {/* ================= DATOS DEL COMERCIO ================= */}
        <section className="bg-white border rounded-2xl p-8 shadow-sm space-y-8">
          <div>
            <h3 className="text-xl font-semibold">
              Datos del comercio
            </h3>
            <p className="text-sm text-neutral-500">
              Información pública que verán los compradores.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <CampoTexto id="nombreComercio" label="Nombre del comercio" register={register} error={errors.nombreComercio?.message} />
            <CampoTexto id="direccion" label="Dirección del puesto de venta" register={register} error={errors.direccion?.message} />
            <CampoTexto id="telefonoComercio" label="Teléfono del comercio" register={register} error={errors.telefonoComercio?.message} />

            <div className="space-y-2">
              <Label>Departamento</Label>
              <select
                className="w-full h-12 border rounded-lg px-3 bg-white"
                value={selectedDepartamento}
                onChange={handleDepartamentoChange}
              >
                <option value="">Selecciona</option>
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

            <div className="space-y-2">
              <Label>Municipio</Label>
              <select
                className="w-full h-12 border rounded-lg px-3 bg-white"
                value={watch("municipio")}
                onChange={(e) => setValue("municipio", e.target.value)}
              >
                <option value="">Selecciona</option>
                {municipios.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              {errors.municipio && (
                <p className="text-sm text-red-500">
                  {errors.municipio.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label>Descripción del comercio</Label>
              <Textarea
                className="h-28"
                {...register("descripcion")}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500">
                  {errors.descripcion.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ================= DOCUMENTOS KYC ================= */}
        <section className="bg-orange-50 border border-orange-200 rounded-2xl p-8 space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-orange-700">
              Documentos de verificación
            </h3>
            <p className="text-sm text-orange-600">
              Estos documentos son obligatorios para validar tu identidad y proteger a los compradores.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {["fotoDPIFrente", "fotoDPIReverso", "selfieConDPI"].map((field) => (
              <div key={field} className="space-y-2">
                <Label className="capitalize">
                  {field === "fotoDPIFrente" && "DPI (frente)"}
                  {field === "fotoDPIReverso" && "DPI (reverso)"}
                  {field === "selfieConDPI" && "Selfie con DPI"}
                </Label>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    handleFile(e, field as any, "registro")
                    const file = e.target.files?.[0]
                    if (file) setValue(field as any, file)
                  }}
                />

                {previews[field] && (
                  <img
                    src={previews[field]}
                    className="mt-2 h-24 rounded-lg object-cover border"
                  />
                )}

                {errors[field as keyof RegisterVendedorValues] && (
                  <p className="text-sm text-red-500">
                    {errors[field as keyof RegisterVendedorValues]?.message as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md"
        >
          {isSubmitting ? "Enviando información…" : "Registrar comercio"}
        </Button>

      </form>
    </div>
  )
}