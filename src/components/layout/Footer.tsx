"use client";

import Link from "next/link";

import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";

export default function Footer() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  return (
    <footer className="mt-24 bg-gradient-to-r from-[#0f2e22] to-[#184c37] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="mb-3 font-serif text-xl">Flowjuyu</h3>
            <p className="text-sm leading-relaxed text-white/70">
              {tr("footer.brandDescription")}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 font-medium text-white/80">
              {tr("footer.exploreTitle")}
            </p>
            <Link
              href="/productos"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.exploreCatalog")}
            </Link>
            <Link
              href="/new-arrivals"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.newArrivals")}
            </Link>
            <Link
              href="/sell"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.sellLink")}
            </Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 font-medium text-white/80">
              {tr("footer.helpTitle")}
            </p>
            <Link
              href="/help/faq"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("nav.faq")}
            </Link>
            <Link
              href="/help/contact"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.contactSupport")}
            </Link>
            <Link
              href="/help/returns"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("nav.returns")}
            </Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 font-medium text-white/80">
              {tr("footer.legalTitle")}
            </p>
            <Link
              href="/privacidad"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.privacy")}
            </Link>
            <Link
              href="/terminos"
              className="block text-white/60 transition hover:text-white"
            >
              {tr("footer.terms")}
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40">
          <span>© {new Date().getFullYear()} Flowjuyu</span>
          <span>{tr("footer.madeInGuatemala")} 🇬🇹</span>
        </div>
      </div>
    </footer>
  );
}
