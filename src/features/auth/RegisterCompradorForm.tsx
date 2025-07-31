"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  registerCompradorSchema,
  RegisterCompradorValues,
} from "@/schemas/register-comprador.schema";
import { apiRegisterComprador } from "@/services/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // ✅ Importamos el contexto

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth(); // ✅ Usamos el contexto

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCompradorValues>({
    resolver: zodResolver(registerCompradorSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      confirmarPassword: "",
      telefono: "",
      direccion: "",
    },
  });

  const onSubmit = async (data: RegisterCompradorValues) => {
    console.log("Datos capturados en el formulario:", data);
    const response = await apiRegisterComprador(data);

    if (response.ok && response.user && response.token) {
      // ✅ Guardamos en el contexto y localStorage
      login(response.user, response.token);

      // ✅ Redirigimos según rol
      switch (response.user.rol) {
        case "comprador":
          router.push("/");
          break;
        case "vendedor":
          router.push("/seller/dashboard");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/");
      }
    } else {
      setError("root", { message: response.message || "Error al registrarse" });
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 items-center justify-center", className)}
      {...props}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-screen-md"
      >
        <header className="flex flex-col items-center gap-2">
          <GalleryVerticalEnd className="size-8 text-primary" />
          <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="underline underline-offset-4">
              Inicia sesión
            </a>
          </p>
        </header>

        {/* Campos */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar contraseña</Label>
            <Input id="confirmarPassword" type="password" {...register("confirmarPassword")} />
            {errors.confirmarPassword && (
              <p className="text-sm text-red-500">{errors.confirmarPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono (opcional)</Label>
            <Input id="telefono" {...register("telefono")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección (opcional)</Label>
            <Input id="direccion" {...register("direccion")} />
          </div>
        </div>

        {errors.root && <p className="text-sm text-center text-red-600">{errors.root.message}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creando cuenta..." : "Registrarse"}
        </Button>
      </form>
    </div>
  );
}

export default RegisterForm;
