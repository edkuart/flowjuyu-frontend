// src/app/(auth)/login/page.tsx

import { LoginForm } from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="bg-[#f8f5ef] min-h-screen flex items-center py-24 px-6 md:px-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-20 w-full">

        {/* LEFT SIDE */}
        <div className="space-y-10 text-center lg:text-left">

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl leading-[1.05] font-semibold tracking-tight text-neutral-900">
              Bienvenido de nuevo
            </h1>

            <p className="text-lg text-neutral-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
              Vuelve a conectar con la riqueza textil de Guatemala y continúa explorando piezas auténticas creadas por manos locales.
            </p>
          </div>

          {/* FORM WRAPPER PREMIUM */}
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-8 transition-all duration-300 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.18)]">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — HERO STYLE */}
        <div className="relative hidden lg:flex justify-end items-center">

          {/* Imagen principal */}
          <div className="rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.25)] w-[440px] h-[440px] transform transition duration-500 hover:scale-[1.02]">
            <Image
              src="/cortelogo.png"
              alt="Flowjuyu textiles"
              width={600}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Imagen flotante superior */}
          <div className="absolute -top-12 -right-8 w-[170px] h-[170px] rounded-3xl overflow-hidden shadow-xl hidden xl:block animate-fade-in">
            <Image
              src="/cortelogo.png"
              alt="Detalle textil"
              width={300}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>

        </div>
      </div>
    </main>
  );
}
