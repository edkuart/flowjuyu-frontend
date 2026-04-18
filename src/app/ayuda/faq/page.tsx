"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle, RotateCcw } from "lucide-react";

type FAQItem = {
  q: string;
  a: string;
};

type FAQSection = {
  title: string;
  items: FAQItem[];
};

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: "Compras y pagos",
    items: [
      {
        q: "¿Cómo realizo un pedido?",
        a: "Explora el catálogo, elige la pieza que deseas y agrégala al carrito. Una vez lista tu selección, sigue el proceso de pago. Recibirás un correo de confirmación con los detalles de tu pedido.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Aceptamos tarjetas de crédito y débito Visa, Mastercard y American Express, así como pagos en efectivo a través de agentes autorizados en Guatemala.",
      },
      {
        q: "¿Es seguro comprar en Flowjuyu?",
        a: "Sí. Todos los pagos se procesan con cifrado SSL y los datos de tu tarjeta nunca son almacenados en nuestros servidores. Trabajamos únicamente con procesadores de pago certificados.",
      },
      {
        q: "¿Puedo cancelar mi pedido?",
        a: "Puedes cancelar tu pedido dentro de las primeras 24 horas de haberlo realizado, siempre que el vendedor no haya iniciado el proceso de envío. Contacta a soporte desde tu cuenta para gestionar la cancelación.",
      },
    ],
  },
  {
    title: "Envíos y entrega",
    items: [
      {
        q: "¿A qué departamentos hacen envíos?",
        a: "Realizamos envíos a todos los departamentos de Guatemala. El tiempo de entrega varía entre 2 y 7 días hábiles dependiendo de tu ubicación.",
      },
      {
        q: "¿Cómo puedo rastrear mi pedido?",
        a: "Una vez que el vendedor confirme el envío, recibirás un correo con el número de guía y el enlace de rastreo de la empresa de transporte.",
      },
      {
        q: "¿Qué pasa si mi paquete llega dañado?",
        a: "Fotografía el paquete antes de abrirlo y contáctanos dentro de las 48 horas siguientes a la recepción. Gestionaremos el caso directamente con el vendedor para encontrar una solución.",
      },
    ],
  },
  {
    title: "Vendedores y artesanos",
    items: [
      {
        q: "¿Los vendedores son verificados?",
        a: "Sí. Todos los artesanos y vendedores en Flowjuyu pasan por un proceso de verificación de identidad (KYC) antes de publicar productos. Esto garantiza la autenticidad de cada pieza.",
      },
      {
        q: "¿Puedo comunicarme directamente con el vendedor?",
        a: "Dentro de cada pedido tendrás acceso a un canal de mensajes directo con el vendedor para coordinar detalles, preguntas sobre la pieza o el envío.",
      },
      {
        q: "¿Cómo sé que la pieza es auténtica?",
        a: "Cada producto incluye información del origen geográfico y el artesano que lo elaboró. Los tejidos tradicionales cuentan además con una descripción de la técnica y materiales utilizados.",
      },
    ],
  },
  {
    title: "Mi cuenta",
    items: [
      {
        q: "¿Cómo recupero mi contraseña?",
        a: "En la pantalla de inicio de sesión, selecciona \"¿Olvidaste tu contraseña?\". Te enviaremos un enlace de recuperación al correo electrónico registrado.",
      },
      {
        q: "¿Puedo tener cuenta de comprador y vendedor al mismo tiempo?",
        a: "Actualmente las cuentas de comprador y vendedor son separadas. Si ya tienes cuenta de comprador y deseas vender, regístrate con un correo diferente o contáctanos.",
      },
    ],
  },
];

function Accordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0d2d20]/8 last:border-0">
      <button
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="font-serif italic text-[17px] leading-snug text-[#0d2d20]">
          {item.q}
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-[#0d2d20]/40 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-[15px] leading-relaxed text-[#0d2d20]/65">{item.a}</p>
      </div>
    </div>
  );
}

export default function FaqPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-[#f8f5ef]">
      {/* ── Editorial header ── */}
      <div className="relative overflow-hidden bg-[#0d2d20] pb-16 pt-20 text-white md:pb-20 md:pt-28">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-3xl space-y-5 px-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/40">
            <span className="mr-2 text-[#d4a853]" aria-hidden>
              ✦
            </span>
            Centro de ayuda
          </p>
          <h1 className="font-serif italic text-[2.5rem] leading-[1.05] tracking-[-0.02em] md:text-[3.25rem]">
            Preguntas frecuentes
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-white/55">
            Respuestas a las dudas más comunes sobre compras, envíos y cómo funciona Flowjuyu.
          </p>
          <div className="h-px w-16 bg-gradient-to-r from-[#d4a853] to-transparent" />
        </div>
      </div>

      {/* ── Section tabs ── */}
      <div className="sticky top-[var(--header-height)] z-10 border-b border-[#0d2d20]/10 bg-[#f8f5ef]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl overflow-x-auto px-6">
          <div className="flex gap-1 py-3" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveSection(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors ${
                activeSection === null
                  ? "bg-[#0d2d20] text-white"
                  : "text-[#0d2d20]/50 hover:text-[#0d2d20]"
              }`}
            >
              Todas
            </button>
            {FAQ_SECTIONS.map((s) => (
              <button
                key={s.title}
                onClick={() =>
                  setActiveSection(activeSection === s.title ? null : s.title)
                }
                className={`shrink-0 rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] transition-colors ${
                  activeSection === s.title
                    ? "bg-[#0d2d20] text-white"
                    : "text-[#0d2d20]/50 hover:text-[#0d2d20]"
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FAQ content ── */}
      <div className="mx-auto max-w-3xl space-y-12 px-6 py-14">
        {FAQ_SECTIONS.filter(
          (s) => activeSection === null || s.title === activeSection,
        ).map((section) => (
          <div key={section.title}>
            <h2 className="mb-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[#d4a853]">
              {section.title}
            </h2>
            <div className="mt-4 rounded-xl bg-white/60 px-6 ring-1 ring-[#0d2d20]/8">
              {section.items.map((item) => (
                <Accordion key={item.q} item={item} />
              ))}
            </div>
          </div>
        ))}

        {/* ── Still need help? ── */}
        <div className="rounded-xl bg-[#0d2d20] p-8 text-white">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
            <span className="mr-2 text-[#d4a853]" aria-hidden>
              ✦
            </span>
            ¿No encontraste lo que buscas?
          </p>
          <h3 className="mt-3 font-serif italic text-[1.75rem] leading-tight">
            Escríbenos directamente
          </h3>
          <p className="mt-2 text-[14px] text-white/55">
            Nuestro equipo responde en menos de 24 horas hábiles.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/ayuda/contacto"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[#0d2d20] transition hover:bg-[#f8f5ef]"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              Contactar soporte
            </Link>
            <Link
              href="/ayuda/devoluciones"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Política de devoluciones
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
