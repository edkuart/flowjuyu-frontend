'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/schemas/login-schema';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/context/AuthContext';
import { safeRedirectForRole } from '@/lib/safeRedirect';
import { getDefaultDestination } from '@/lib/authRoutes';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8800';

// ─── Component ────────────────────────────────────────────────────────────────

interface LoginFormProps {
  /** Validated by safeRedirectForRole before use — cannot cause open redirect. */
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const { login, isAuthenticated, user, ready } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const [loginError,     setLoginError]     = useState<string | null>(null);
  const [googleLoading,  setGoogleLoading]  = useState(false);

  // ── Redirect-away for already-authenticated users ─────────────────────────
  // Middleware is the primary guard, but it fails open when the Edge→backend
  // call times out. This effect is the guaranteed client-side fallback.
  //
  // WHY window.location.replace instead of router.replace:
  //   router.replace() in Next.js App Router uses React.startTransition
  //   internally. In production concurrent mode, transitions are lower-priority
  //   and can be silently abandoned when a higher-priority update (parent
  //   re-render, prefetch, layout transition) arrives during the navigate.
  //   window.location.replace() is a synchronous browser API — it cannot be
  //   cancelled by React's scheduler and commits the navigation immediately.
  //
  // WHY useRef guard:
  //   router from useRouter() gets a new object reference during hydration and
  //   prefetch updates. Without the guard the effect can fire multiple times,
  //   and a second router.replace() call can cancel the first in-flight transition.
  //   The ref ensures we only ever attempt the navigation once per mount.
  //
  // WHY router is NOT in the dependency array:
  //   We no longer call router.replace, so router has no role here. Including
  //   it was causing spurious re-runs from App Router's context updates.
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!ready || !isAuthenticated || !user) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    const destination =
      safeRedirectForRole(redirectTo, user.role) ?? getDefaultDestination(user.role);

    window.location.replace(destination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isAuthenticated, user, redirectTo]);

  // ── Email / password login ────────────────────────────────────────────────

  const onSubmit = async (data: LoginValues) => {
    setLoginError(null);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo:   data.email,
          password: data.password,
        }),
      });

      const json = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok || !json.ok || !json.token || !json.user) {
        const msg = res.status === 429
          ? 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
          : ((json.message as string) || 'Credenciales incorrectas');
        setLoginError(msg);
        return;
      }

      const user = json.user as User;
      login(user, json.token as string);

      const destination =
        safeRedirectForRole(redirectTo, user.role) ?? getDefaultDestination(user.role);
      router.push(destination);
    } catch {
      setLoginError('Error de conexión con el servidor');
    }
  };

  // ── Google login ──────────────────────────────────────────────────────────
  //
  // Flow:
  //   1. Firebase popup authenticates the user with Google.
  //   2. We get a short-lived Firebase ID token (signed by Google).
  //   3. We POST it to our backend, which verifies it cryptographically
  //      via Firebase Admin SDK and issues our own JWT + refresh cookie.
  //   4. Login and redirect via the same path as email/password.

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Force account picker so users can switch accounts without signing out.
      provider.setCustomParameters({ prompt: 'select_account' });

      const result   = await signInWithPopup(auth, provider);
      const id_token = await result.user.getIdToken();

      const res = await fetch(`${API_URL}/api/login/google`, {
        method:      'POST',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token }),
      });

      const json = await res.json().catch(() => ({})) as Record<string, unknown>;

      if (!res.ok || !json.ok || !json.token || !json.user) {
        const msg = res.status === 429
          ? 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.'
          : ((json.message as string) || 'No se pudo iniciar sesión con Google');
        setLoginError(msg);
        return;
      }

      const user = json.user as User;
      login(user, json.token as string);

      // New users (just created via Google) go to the welcome page
      // where they choose between buyer and seller paths.
      if (json.is_new_user) {
        router.push('/welcome');
        return;
      }

      const destination =
        safeRedirectForRole(redirectTo, user.role) ?? getDefaultDestination(user.role);
      router.push(destination);
    } catch (err: any) {
      // User closed the popup — not an error worth surfacing.
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      setLoginError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AuthLayout heading="Inicia sesión" subheading="Accede a tu cuenta Flowjuyu">
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full"
    >
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
          <p className="text-xs text-red-500">{errors.email.message}</p>
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
          <p className="text-xs text-red-500">{errors.password.message}</p>
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
        disabled={isSubmitting || googleLoading}
        className="h-11 rounded-xl bg-[#0F3D3A] hover:bg-[#0c322f] text-white font-medium tracking-wide transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
      </Button>

      {/* DIVIDER */}
      <div className="relative text-center text-xs text-neutral-400 my-2">
        <span className="bg-white px-3 relative z-10">O continúa con</span>
        <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-200" />
      </div>

      {/* GOOGLE BUTTON */}
      <Button
        type="button"
        variant="outline"
        disabled={isSubmitting || googleLoading}
        className="h-11 rounded-xl flex items-center justify-center gap-2.5 border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-200 shadow-sm disabled:opacity-60"
        onClick={handleGoogleLogin}
      >
        {googleLoading ? (
          <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
        ) : (
          <FcGoogle className="text-lg" />
        )}
        <span className="text-sm font-medium text-neutral-700">
          {googleLoading ? 'Conectando...' : 'Continuar con Google'}
        </span>
      </Button>
    </form>

    {/* NEW USER CTA */}
    <p className="text-center text-sm text-neutral-500 mt-4">
      ¿Nuevo en Flowjuyu?{' '}
      <Link
        href="/register/buyer"
        className="font-medium text-[#0F3D3A] hover:text-[#0c322f] hover:underline transition-colors"
      >
        Empieza aquí
      </Link>
    </p>
    </AuthLayout>
  );
}
