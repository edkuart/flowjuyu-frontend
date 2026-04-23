"use client";

import Link from "next/link";

import { useLanguage } from "@/i18n/context/useLanguage";
import esDictionary from "@/i18n/dictionaries/es";
import { createT } from "@/i18n/utils/t";
import { LEGAL_COOKIE_NOTICE } from "@/lib/legal";

export default function Footer() {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);

  return (
    <footer className="brand-shell mt-24 border-t border-[var(--brand-line)]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-faint)]">
              Marketplace textil
            </p>
            <h3 className="mb-3 font-serif text-2xl text-[var(--brand-ink)]">Flowjuyu</h3>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--brand-soft)]">
              {tr("footer.brandDescription")}
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-faint)]">
              {tr("footer.exploreTitle")}
            </p>
            <Link
              href="/productos"
              className="brand-link-soft block"
            >
              {tr("footer.exploreCatalog")}
            </Link>
            <Link
              href="/new-arrivals"
              className="brand-link-soft block"
            >
              {tr("footer.newArrivals")}
            </Link>
            <Link
              href="/sell"
              className="brand-link-soft block"
            >
              {tr("footer.sellLink")}
            </Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-faint)]">
              {tr("footer.helpTitle")}
            </p>
            <Link
              href="/help/faq"
              className="brand-link-soft block"
            >
              {tr("nav.faq")}
            </Link>
            <Link
              href="/help/contact"
              className="brand-link-soft block"
            >
              {tr("footer.contactSupport")}
            </Link>
            <Link
              href="/help/returns"
              className="brand-link-soft block"
            >
              {tr("nav.returns")}
            </Link>
          </div>

          <div className="space-y-2 text-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-faint)]">
              {tr("footer.legalTitle")}
            </p>
            <Link
              href="/legal/privacy"
              className="brand-link-soft block"
            >
              {tr("footer.privacy")}
            </Link>
            <Link
              href="/legal/terms"
              className="brand-link-soft block"
            >
              {tr("footer.terms")}
            </Link>
            <Link
              href="/legal/communications"
              className="brand-link-soft block"
            >
              Comunicaciones
            </Link>
          </div>
        </div>

        <div className="brand-panel mt-10 px-4 py-3 text-sm text-[var(--brand-soft)]">
          {LEGAL_COOKIE_NOTICE}
        </div>

        <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-[var(--brand-line)] pt-6 text-xs text-[var(--brand-faint)]">
          <span>© {new Date().getFullYear()} Flowjuyu</span>
          <span>{tr("footer.madeInGuatemala")} GT</span>
        </div>
      </div>
    </footer>
  );
}
