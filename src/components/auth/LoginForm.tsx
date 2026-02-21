'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/schemas/login-schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const [loginError, setLoginError] = useState<string | null>(null);

  // ===========================
  // Login normal
  // ===========================
  const onSubmit = async (data: LoginValues) => {
    setLoginError(null);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: data.email,
          password: data.password,
        }),
      });

      const json = await res.json();

      console.log("ROL BACKEND:", json.user?.rol);

      if (!res.ok || !json.token || !json.user) {
        setLoginError(json.message || 'Credenciales incorrectas');
        return;
      }

      login(json.user, json.token);
      localStorage.setItem('token', json.token);

      const rawRole = json.user.role ?? json.user.rol ?? null;

      if (rawRole === 'seller' || rawRole === 'vendedor') {
        router.push('/seller/my-business');
      } else if (rawRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error login:', error);
      setLoginError('Error de conexión con el servidor');
    }
  };

  // ===========================
  // Google (placeholder)
  // ===========================
  const handleGoogleLogin = async () => {
    // Por ahora solo placeholder
    alert('Google login próximamente disponible');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-7 w-full"
    >
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Inicia sesión
        </h2>
        <p className="text-sm text-neutral-500">
          Accede a tu cuenta Flowjuyu
        </p>
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-neutral-700">
          Correo electrónico
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          className="h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-xs text-red-500">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm text-neutral-700">
            Contraseña
          </Label>
          <a
            href="/recuperar-password"
            className="text-xs text-neutral-500 hover:text-[#0F3D3A] transition"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Input
          id="password"
          type="password"
          className="h-11 rounded-xl border-neutral-200 focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0 transition-all"
          {...register('password')}
        />

        {errors.password && (
          <p className="text-xs text-red-500">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* ERROR GLOBAL */}
      {loginError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-200">
          {loginError}
        </div>
      )}

      {/* LOGIN BUTTON */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>

      {/* DIVIDER */}
      <div className="relative text-center text-xs text-neutral-400 my-2">
        <span className="bg-white px-3 relative z-10">
          O continúa con
        </span>
        <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200" />
      </div>

      {/* GOOGLE BUTTON */}
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl flex items-center justify-center gap-2 border-neutral-200 hover:bg-neutral-50 transition"
        onClick={handleGoogleLogin}
      >
        <img
          src="/icons/google.svg"
          alt="Google"
          className="w-4 h-4"
        />
        Iniciar sesión con Google
      </Button>
    </form>
  );
}