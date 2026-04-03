"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT, type TranslationKey } from "@/i18n/utils/t";

type AuthHeroLayoutProps = {
  title?: string;
  subtitle?: string;
  titleKey?: TranslationKey;
  subtitleKey?: TranslationKey;
  children: React.ReactNode;
};

export default function AuthHeroLayout({
  title,
  subtitle,
  titleKey,
  subtitleKey,
  children,
}: AuthHeroLayoutProps) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const resolvedTitle = titleKey ? tr(titleKey) : (title ?? "");
  const resolvedSubtitle = subtitleKey ? tr(subtitleKey) : (subtitle ?? "");

  return (
    <section className="flex min-h-screen flex-col justify-center bg-[#f8f5ef] px-6 py-16 md:px-12">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="flex flex-col space-y-10">
          <div className="max-w-lg">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {tr("auth.backHome")}
            </Link>

            <h1 className="text-4xl leading-tight font-semibold tracking-tight text-neutral-900 md:text-5xl">
              {resolvedTitle}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-neutral-600">
              {resolvedSubtitle}
            </p>

            <div className="mt-6 h-[3px] w-14 rounded-full bg-[#0F3D3A]" />
          </div>

          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] md:p-10">
            {children}
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <div className="flex h-[380px] w-[380px] items-center justify-center rounded-3xl bg-[#f3efe6] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)]">
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
