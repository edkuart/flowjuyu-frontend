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
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";

export function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

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

  // Formulario tradicional
  const onSubmit = async (data: RegisterCompradorValues) => {
    const response = await apiRegisterComprador(data);

    if (response.ok && response.user && response.token) {
      login(response.user, response.token);
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

  // Registro/login con Google
  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { email, displayName } = result.user;

      // Cambia el endpoint por el que uses realmente en tu backend
      const response = await fetch("http://localhost:8800/api/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nombre: displayName }),
      });

      const data = await response.json();

      if (data.ok && data.user && data.token) {
        login(data.user, data.token);
        switch (data.user.rol) {
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
        alert(data.message || "No se pudo crear/iniciar sesión con Google.");
      }
    } catch (error: any) {
      alert("Error con Google: " + (error?.message || error));
    } finally {
      setGoogleLoading(false);
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

      {/* Separador y botón de Google */}
      <div className="w-full max-w-screen-md flex flex-col gap-2 mt-6">
        <div className="relative text-center text-xs text-muted-foreground my-2">
          <span className="bg-background px-2 z-10 relative">O usa</span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-muted-foreground opacity-30 -z-10"></div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          <img
            src="/icons/google.svg"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          {googleLoading ? "Conectando con Google..." : "Registrarse / Iniciar sesión con Google"}
        </Button>
      </div>
    </div>
  );
}

export default RegisterForm;
