//src/components/auth/AuthHeroLayout.tsx

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

type AuthHeroLayoutProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthHeroLayout({
  title,
  subtitle,
  children,
}: AuthHeroLayoutProps) {
  return (
    <section className="bg-[#f8f5ef] min-h-screen flex flex-col justify-center px-6 md:px-12 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 w-full items-center">

        {/* LEFT SIDE */}
        <div className="flex flex-col space-y-10">

          <div className="max-w-lg">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-neutral-900 tracking-tight">
              {title}
            </h1>

            <p className="text-neutral-600 mt-4 text-lg leading-relaxed">
              {subtitle}
            </p>

            <div className="mt-6 w-14 h-[3px] bg-[#0F3D3A] rounded-full" />
          </div>

          {/* 🔥 AQUÍ ESTÁ EL CAMBIO CLAVE */}
          <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] p-8 md:p-10 w-full max-w-2xl">
            {children}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="rounded-3xl bg-[#f3efe6] w-[380px] h-[380px] flex items-center justify-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]">
            <Image
              src="/logo-flowjuyu.png"
              alt="Flowjuyu"
              width={240}
              height={240}
              className="object-contain"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}