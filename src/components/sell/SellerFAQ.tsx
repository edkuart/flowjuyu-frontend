"use client";

import React, { useState } from "react";
import Link from "next/link";
import { token, Eyebrow, SectionHeading, Rule, IconChevronDown, IconArrow } from "./shared";

const FAQS = [
  { q: "¿Necesito experiencia en tecnología?",               a: "No. Flowjuyu está diseñado para que cualquier artesano pueda usarlo con facilidad. Solo necesitas un teléfono o computadora para publicar tus textiles y gestionar tus pedidos." },
  { q: "¿Cuáles son las comisiones?",                        a: "Nuestras comisiones son transparentes y se ubican entre el 10 % y el 15 % según el método de pago. Sin costos ocultos, sin sorpresas." },
  { q: "¿Cuándo recibo mi pago?",                            a: "Los pagos se procesan periódicamente tras la confirmación de entrega del pedido. El dinero llega directamente a tu cuenta bancaria o billetera digital." },
  { q: "¿Puedo vender desde cualquier región de Guatemala?", a: "Sí. Flowjuyu está disponible para artesanos en todo el territorio guatemalteco. Solo necesitas acceso a internet para administrar tu tienda." },
  { q: "¿Flowjuyu me ayuda con el envío?",                   a: "Ofrecemos orientación sobre opciones de envío nacionales e internacionales. En el futuro próximo integraremos alianzas con servicios de mensajería." },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div>
      <Rule />
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // Generous tap target for mobile
          gap: 20,
          padding: "22px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(16px, 3vw, 19px)", fontWeight: 600, color: token.green, lineHeight: 1.3 }}>
          {q}
        </span>
        <span style={{ color: token.muted, flexShrink: 0 }}>
          <IconChevronDown open={isOpen} />
        </span>
      </button>
      <div style={{ maxHeight: isOpen ? 300 : 0, overflow: "hidden", transition: "max-height 0.35s cubic-bezier(.4,0,.2,1)" }}>
        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, lineHeight: 1.8, color: token.muted, fontWeight: 300, padding: "0 0 22px", margin: 0 }}>
          {a}
        </p>
      </div>
    </div>
  );
}

export default function SellerFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ background: token.bg, padding: "clamp(64px, 10vw, 128px) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 72px)" }}>

        <div className="fj-faq-header">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading>Preguntas frecuentes</SectionHeading>
          </div>
          {/* Hidden on mobile via .fj-faq-link */}
          <Link
            href="/help/contact"
            className="fj-faq-link"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: token.green, textDecoration: "none", borderBottom: `1px solid ${token.green}`, paddingBottom: 2 }}
          >
            Más preguntas <IconArrow />
          </Link>
        </div>

        <div style={{ maxWidth: 760 }}>
          {FAQS.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q}
              a={f.a}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}
          <Rule />

          {/* Contact link shown below accordion on mobile */}
          <div style={{ paddingTop: 32 }}>
            <Link
              href="/help/contact"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: token.green, textDecoration: "none", borderBottom: `1px solid ${token.green}`, paddingBottom: 2 }}
            >
              ¿Más preguntas? Contáctanos <IconArrow />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}