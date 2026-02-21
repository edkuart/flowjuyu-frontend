"use client";

// 1. Agregamos la importación de Image de Next.js
import Image from "next/image";
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
import Link from "next/link";

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
      className={cn("flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4 py-12 bg-gray-50/50", className)}
      {...props}
    >
      <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-10">
        
        <header className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-orange-50 p-3 rounded-2xl">
            <GalleryVerticalEnd className="size-8 text-orange-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crea tu cuenta</h1>
          <p className="text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link 
              href="/login" 
              className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-gray-700 font-medium">Nombre</Label>
              <Input 
                id="nombre" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("nombre")} 
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Correo electrónico</Label>
              <Input 
                id="email" 
                type="email" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("email")} 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("password")} 
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmarPassword" className="text-gray-700 font-medium">Confirmar contraseña</Label>
              <Input 
                id="confirmarPassword" 
                type="password" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("confirmarPassword")} 
              />
              {errors.confirmarPassword && (
                <p className="text-sm text-red-500">{errors.confirmarPassword.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-gray-700 font-medium">Teléfono (opcional)</Label>
              <Input 
                id="telefono" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("telefono")} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direccion" className="text-gray-700 font-medium">Dirección (opcional)</Label>
              <Input 
                id="direccion" 
                className="rounded-xl border-gray-200 focus-visible:ring-orange-500" 
                {...register("direccion")} 
              />
            </div>
          </div>

          {errors.root && (
            <div className="p-3 text-sm text-center text-red-600 bg-red-50 rounded-lg">
              {errors.root.message}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full py-6 text-base font-semibold rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors"
          >
            {isSubmitting ? "Creando cuenta..." : "Registrarse"}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-500 font-medium">O continúa con</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full py-6 text-base font-medium rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
        >
          {
                
          }
          <Image
            src="/icons/google.svg"
            alt="Google"
            width={20} 
            height={20} 
            className="mr-3"
          />
          {googleLoading ? "Conectando..." : "Google"}
        </Button>
      </div>
    </div>
  );
}

export default RegisterForm;