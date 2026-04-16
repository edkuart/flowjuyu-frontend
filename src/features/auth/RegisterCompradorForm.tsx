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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import { getDefaultDestination } from "@/lib/authRoutes";
import {
  consumeGoogleRedirectResult,
  startGoogleRedirect,
} from "@/lib/socialAuth";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import AuthLayout from "@/components/auth/AuthLayout";

// ── Shared input class — matches LoginForm exactly ───────────────────────────
const INPUT_CLS =
  "h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all";

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleRedirectHandled = useRef(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
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
      acceptedLegalTerms: false,
    },
  });

  // ── Email / password register ──────────────────────────────────────────────

  const onSubmit = async (data: RegisterCompradorValues) => {
    const response = await apiRegisterComprador(data);

    if (response.ok && response.user && response.token) {
      login(response.user, response.token);

      switch (response.user.role) {
        case "buyer":
          router.push("/welcome");
          break;
        case "seller":
          router.push("/seller/account-status");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/welcome");
      }
    } else {
      setError("root", {
        message: response.message || "Error al registrarse",
      });
    }
  };

  useEffect(() => {
    if (googleRedirectHandled.current) return;
    googleRedirectHandled.current = true;

    async function handleGoogleRedirect() {
      setGoogleLoading(true);

      try {
        const result = await consumeGoogleRedirectResult("register");
        if (!result) return;

        const { res: response, json } = result;
        const data = json as Record<string, unknown>;

        if (!response.ok || !data.ok || !data.user || !data.token) {
          setError("root", {
            message:
              (data.message as string) ||
              "No se pudo crear/iniciar sesión con Google.",
          });
          return;
        }

        const nextUser = data.user as User;
        login(nextUser, data.token as string, data);
        router.push(
          data.is_new_user
            ? "/welcome"
            : getDefaultDestination(nextUser.role),
        );
      } catch (error: any) {
        if (error?.code === "auth/no-auth-event") return;
        setError("root", {
          message: "Error al conectar con Google. Inténtalo de nuevo.",
        });
      } finally {
        setGoogleLoading(false);
      }
    }

    void handleGoogleRedirect();
  }, [login, router, setError]);

  // ── Google signup ──────────────────────────────────────────────────────────

  const handleGoogleSignup = async () => {
    if (!watch("acceptedLegalTerms")) {
      setError("acceptedLegalTerms", {
        message: "Debes aceptar los Términos y la Política de Privacidad",
      });
      return;
    }

    setGoogleLoading(true);
    try {
      await startGoogleRedirect("register");
    } catch (error: any) {
      if (error?.message === "Google redirect did not leave the page as expected.") {
        return;
      }
      setError("root", { message: "Error al conectar con Google. Inténtalo de nuevo." });
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AuthLayout
      heading="Crea tu cuenta"
      subheading="Únete a Flowjuyu y descubre artesanías guatemaltecas únicas."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre" className="text-sm text-neutral-700">Nombre</Label>
            <Input id="nombre" className={INPUT_CLS} {...register("nombre")} />
            {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-neutral-700">Correo electrónico</Label>
            <Input id="email" type="email" className={INPUT_CLS} {...register("email")} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-neutral-700">Contraseña</Label>
            <Input id="password" type="password" className={INPUT_CLS} {...register("password")} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmarPassword" className="text-sm text-neutral-700">Confirmar contraseña</Label>
            <Input id="confirmarPassword" type="password" className={INPUT_CLS} {...register("confirmarPassword")} />
            {errors.confirmarPassword && <p className="text-xs text-red-500">{errors.confirmarPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="telefono" className="text-sm text-neutral-700">Teléfono <span className="text-neutral-400">(opcional)</span></Label>
            <Input id="telefono" className={INPUT_CLS} {...register("telefono")} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="direccion" className="text-sm text-neutral-700">Dirección <span className="text-neutral-400">(opcional)</span></Label>
            <Input id="direccion" className={INPUT_CLS} {...register("direccion")} />
          </div>
        </div>

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

        {errors.root && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
            {errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || googleLoading}
          className="w-full h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {isSubmitting ? "Creando cuenta..." : "Registrarse"}
        </Button>

        {/* Divider */}
        <div className="relative text-center text-xs text-neutral-400">
          <span className="bg-white px-3 relative z-10">O continúa con</span>
          <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200" />
        </div>

        {/* Google */}
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || googleLoading}
          className="w-full h-11 rounded-xl flex items-center justify-center gap-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm disabled:opacity-60"
          onClick={handleGoogleSignup}
        >
          {googleLoading ? (
            <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
          ) : (
            <FcGoogle className="text-lg" />
          )}
          <span className="text-sm font-medium text-neutral-700">
            {googleLoading ? "Conectando..." : "Continuar con Google"}
          </span>
        </Button>

      </form>

      <p className="text-center text-sm text-neutral-500 mt-2">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline transition-colors"
        >
          Inicia sesión
        </Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterForm;
