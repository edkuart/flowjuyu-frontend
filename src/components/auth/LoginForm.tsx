"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";

import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/context/AuthContext";
import { parseConsentHints } from "@/lib/consent";
import { buildConsentReviewPath } from "@/lib/consentNavigation";
import { safeAppRedirectForRole } from "@/lib/safeRedirect";
import { getDefaultDestination } from "@/lib/authRoutes";
import { getApiUrl } from "@/lib/config";
import {
  clearGoogleAuthIntent,
  signInWithGoogle,
  GoogleAuthCancelled,
} from "@/lib/socialAuth";
import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { loginSchema, LoginValues } from "@/schemas/login-schema";

const API_URL = getApiUrl();

interface LoginFormProps {
  redirectTo?: string;
  allowAuthenticated?: boolean;
}

export function LoginForm({ redirectTo, allowAuthenticated = false }: LoginFormProps) {
  const {
    login,
    isAuthenticated,
    user,
    ready,
    consentReady,
    needsConsent,
  } = useAuth();
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (allowAuthenticated) return;
    if (!ready || !consentReady || !isAuthenticated || !user) return;
    if (hasRedirected.current) return;

    hasRedirected.current = true;

    const destination =
      safeAppRedirectForRole(redirectTo, user.role) ??
      getDefaultDestination(user.role);

    window.location.replace(
      needsConsent ? buildConsentReviewPath(destination) : destination,
    );
  }, [allowAuthenticated, ready, consentReady, isAuthenticated, user, redirectTo, needsConsent]);

  // Clear any stale redirect intent left from a previous signInWithRedirect flow
  useEffect(() => {
    clearGoogleAuthIntent();
  }, []);

  const onSubmit = async (data: LoginValues) => {
    setLoginError(null);

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: data.email,
          password: data.password,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;

      if (!res.ok || !json.ok || !json.token || !json.user) {
        const msg =
          res.status === 429
            ? tr("auth.loginRateLimitError")
            : (json.message as string) || tr("auth.loginCredentialsError");
        setLoginError(msg);
        return;
      }

      const nextUser = json.user as User;
      const consentHints = parseConsentHints(json);
      login(nextUser, json.token as string, json);

      const destination =
        safeAppRedirectForRole(redirectTo, nextUser.role) ??
        getDefaultDestination(nextUser.role);
      window.location.replace(
        consentHints?.needsConsent
          ? buildConsentReviewPath(destination)
          : destination,
      );
    } catch {
      setLoginError(tr("auth.loginConnectionError"));
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setGoogleLoading(true);

    try {
      const { res, json } = await signInWithGoogle();

      if (!res.ok || !json.ok || !json.token || !json.user) {
        const msg =
          res.status === 429
            ? tr("auth.loginRateLimitError")
            : (json.message as string) || tr("auth.loginGoogleError");
        toast.error(msg);
        setLoginError(msg);
        return;
      }

      const nextUser = json.user as User;
      const consentHints = parseConsentHints(json);
      login(nextUser, json.token as string, json);

      if (json.is_new_user) {
        toast.success("¡Cuenta creada con Google!");
        window.location.replace("/welcome");
        return;
      }

      const destination =
        safeAppRedirectForRole(redirectTo, nextUser.role) ??
        getDefaultDestination(nextUser.role);
      window.location.replace(
        consentHints?.needsConsent
          ? buildConsentReviewPath(destination)
          : destination,
      );
    } catch (err) {
      if (err instanceof GoogleAuthCancelled) return; // user closed popup — no error shown
      const msg =
        err instanceof Error ? err.message : tr("auth.loginGoogleError");
      toast.error(msg);
      setLoginError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      heading={tr("auth.loginHeading")}
      subheading={tr("auth.loginSubheading")}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6"
      >
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-neutral-700">
            {tr("auth.emailLabel")}
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="h-11 rounded-xl border-neutral-200 transition-all focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm text-neutral-700">
              {tr("auth.passwordLabel")}
            </Label>
            <a
              href="/recuperar-password"
              className="text-xs text-neutral-500 transition hover:text-[#0F3D3A]"
            >
              {tr("auth.forgotPassword")}
            </a>
          </div>

          <Input
            id="password"
            type="password"
            className="h-11 rounded-xl border-neutral-200 transition-all focus-visible:ring-2 focus-visible:ring-[#0F3D3A] focus-visible:ring-offset-0"
            {...register("password")}
          />

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        {loginError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {loginError}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || googleLoading}
          className="h-11 rounded-xl bg-[#0F3D3A] font-medium tracking-wide text-white shadow-sm transition-all duration-200 hover:bg-[#0c322f] hover:shadow-md"
        >
          {isSubmitting ? tr("auth.loginSubmitting") : tr("auth.loginButton")}
        </Button>

        <div className="relative my-2 text-center text-xs text-neutral-400">
          <span className="relative z-10 bg-white px-3">
            {tr("auth.dividerText")}
          </span>
          <div className="absolute top-1/2 right-0 left-0 border-t border-neutral-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting || googleLoading}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
          onClick={handleGoogleLogin}
        >
          {googleLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
          ) : (
            <FcGoogle className="text-lg" />
          )}
          <span className="text-sm font-medium text-neutral-700">
            {googleLoading
              ? tr("auth.googleConnecting")
              : tr("auth.googleButton")}
          </span>
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-neutral-500">
        {tr("auth.newHere")}{" "}
        <Link
          href="/register/buyer"
          className="font-medium text-[#0F3D3A] transition-colors hover:text-[#0c322f] hover:underline"
        >
          {tr("auth.startHere")}
        </Link>
      </p>
    </AuthLayout>
  );
}
