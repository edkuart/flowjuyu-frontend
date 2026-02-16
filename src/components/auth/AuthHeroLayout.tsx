"use client";

import Image from "next/image";
import React from "react";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthHeroLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="bg-[#f8f5ef] min-h-screen flex items-center px-6 md:px-16 py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16 w-full">

        {/* LADO IZQUIERDO — TEXTO + FORM */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-neutral-900">
              {title}
            </h1>
            <p className="text-neutral-600 mt-4 text-lg max-w-md">
              {subtitle}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            {children}
          </div>
        </div>

        {/* LADO DERECHO — IMAGEN ARTESANAL */}
        <div className="relative hidden lg:flex justify-center items-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl w-[420px] h-[420px]">
            <Image
              src="/cortelogo.png"
              alt="Flowjuyu"
              width={600}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}