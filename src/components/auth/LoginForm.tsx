'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginValues } from '@/schemas/login-schema';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image'; // ✅ Importación necesaria

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
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

  const onSubmit = async (data: LoginValues) => {
    setLoginError(null);

    try {
      const res = await fetch('http://localhost:8800/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: data.email,
          contraseña: data.password,
        }),
      });

      const json = await res.json();

      if (res.ok && json.token && json.user) {
        login(json.user, json.token);

        switch (json.user.rol) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'vendedor':
            router.push('/seller/dashboard');
            break;
          default:
            router.push('/');
        }
      } else {
        setLoginError(json.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setLoginError('Error de conexión con el servidor');
    }
  };

  return (
    <div className={cn('flex flex-col gap-6 w-full max-w-3xl', className)} {...props}>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* FORMULARIO */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-10 flex flex-col gap-6 w-full"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
              <p className="text-muted-foreground">
                Inicia sesión para acceder a tu cuenta
              </p>
            </div>

            <div className="grid gap-4">
              {/* EMAIL */}
              <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <a
                    href="/recuperar-password"
                    className="text-sm underline hover:text-primary"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <Input id="password" type="password" {...register('password')} />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* ERROR LOGIN */}
              {loginError && (
                <p className="text-sm text-red-600">{loginError}</p>
              )}

              {/* BOTÓN */}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </div>
          </form>

          {/* IMAGEN DECORATIVA */}
          <div className="relative hidden md:block min-h-[400px] bg-gray-100">
            <Image
              src="/cortelogo.png" // ✅ Asegúrate de que esta imagen esté en /public
              alt="Login cultural"
              fill
              className="object-cover rounded-r-xl"
              priority
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
