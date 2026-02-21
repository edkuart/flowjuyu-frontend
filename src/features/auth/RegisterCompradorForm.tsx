"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  registerCompradorSchema,
  RegisterCompradorValues,
} from "@/schemas/register-comprador.schema";
import { apiRegisterComprador } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GalleryVerticalEnd } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function RegisterForm() {
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
      setError("root", {
        message: response.message || "Error al registrarse",
      });
    }
  };

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
        router.push("/");
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
    <div className="space-y-8">

      {/* Header */}
      <header className="flex flex-col items-center gap-3 text-center">
        <div className="bg-orange-50 p-3 rounded-2xl">
          <GalleryVerticalEnd className="size-8 text-orange-500" />
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Crea tu cuenta
        </h2>

        <p className="text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
          >
            Inicia sesión
          </Link>
        </p>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        <div className="grid sm:grid-cols-2 gap-5">

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">
              Confirmar contraseña
            </Label>
            <Input
              id="confirmarPassword"
              type="password"
              {...register("confirmarPassword")}
            />
            {errors.confirmarPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmarPassword.message}
              </p>
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

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-neutral-500 font-medium">
            O continúa con
          </span>
        </div>
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full py-6 text-base font-medium rounded-xl"
        onClick={handleGoogleSignup}
        disabled={googleLoading}
      >
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
  );
}

export default RegisterForm;