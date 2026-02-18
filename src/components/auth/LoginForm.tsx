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

// 🔹 Firebase Google Login
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
  const [googleLoading, setGoogleLoading] = useState(false);

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

      if (!res.ok || !json.token || !json.user) {
        setLoginError(json.message || 'Credenciales incorrectas');
        return;
      }

      login(json.user, json.token);

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
  // Google Login
  // ===========================
  const handleGoogleLogin = async () => {
    setLoginError(null);
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { email, displayName } = result.user;

      const response = await fetch(`${API_URL}/api/login/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nombre: displayName }),
      });

      const json = await response.json();

      if (!response.ok || !json.token || !json.user) {
        setLoginError(
          json.message || 'No se pudo iniciar sesión con Google.'
        );
        return;
      }

      login(json.user, json.token);

      const rawRole = json.user.role ?? json.user.rol ?? null;

      if (rawRole === 'seller' || rawRole === 'vendedor') {
        router.push('/seller/dashboard');
      } else if (rawRole === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      setLoginError(
        'Error con Google: ' + (error?.message || error)
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full"
    >
      {/* HEADER */}
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-neutral-900">
          Inicia sesión
        </h2>
        <p className="text-sm text-neutral-500">
          Ingresa tus credenciales para continuar
        </p>
      </div>

      {/* EMAIL */}
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          className="h-11 rounded-xl"
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
          <Label htmlFor="password">Contraseña</Label>
          <a
            href="/recuperar-password"
            className="text-xs text-neutral-500 hover:text-neutral-900 transition"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Input
          id="password"
          type="password"
          className="h-11 rounded-xl"
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
        className="h-11 rounded-xl bg-neutral-900 hover:bg-black text-white font-medium tracking-wide transition-all duration-200"
      >
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>

      {/* DIVIDER */}
      <div className="relative text-center text-xs text-neutral-400 my-2">
        <span className="bg-white px-2 relative z-10">
          O continúa con
        </span>
        <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200 -z-10" />
      </div>

      {/* GOOGLE BUTTON */}
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl flex items-center justify-center gap-2"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
      >
        <img
          src="/icons/google.svg"
          alt="Google"
          className="w-4 h-4"
        />
        {googleLoading
          ? 'Conectando con Google...'
          : 'Iniciar sesión con Google'}
      </Button>
    </form>
  );
}
