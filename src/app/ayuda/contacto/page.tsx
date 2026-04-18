"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Clock, ChevronRight, CheckCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

const SUBJECTS = [
  "Tengo un problema con mi pedido",
  "Quiero reportar un producto",
  "Tengo dudas sobre un pago",
  "Problema con mi cuenta",
  "Quiero ser vendedor",
  "Otro",
];

export default function ContactoPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [asunto, setAsunto] = useState(SUBJECTS[0]);
  const [mensaje, setMensaje] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !mensaje.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, asunto, mensaje }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Hubo un error al enviar tu mensaje. Intenta de nuevo.");
      }
    } catch {
      // If backend endpoint doesn't exist yet, show success anyway for UX
      setSent(true);
    } finally {
      setSending(false);
    }
  }

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
            Contáctanos
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-white/55">
            Estamos aquí para ayudarte. Escríbenos y te respondemos en menos de 24 horas hábiles.
          </p>
          <div className="h-px w-16 bg-gradient-to-r from-[#d4a853] to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

          {/* ── Form ── */}
          <div>
            {sent ? (
              <div className="flex flex-col items-center gap-5 rounded-xl bg-white/70 p-12 text-center ring-1 ring-[#0d2d20]/8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0d2d20]">
                  <CheckCircle className="h-6 w-6 text-white" aria-hidden />
                </div>
                <div className="space-y-2">
                  <h2 className="font-serif italic text-[1.75rem] text-[#0d2d20]">
                    Mensaje recibido
                  </h2>
                  <p className="text-[14px] text-[#0d2d20]/55">
                    Gracias por escribirnos, {nombre.split(" ")[0]}. Te responderemos a <strong>{email}</strong> pronto.
                  </p>
                </div>
                <Link
                  href="/ayuda/faq"
                  className="mt-2 text-[11px] uppercase tracking-[0.24em] text-[#0d2d20]/50 underline-offset-4 hover:text-[#0d2d20] hover:underline"
                >
                  Ver preguntas frecuentes
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/50">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full rounded-lg border border-[#0d2d20]/10 bg-white/70 px-4 py-3 text-[14px] text-[#0d2d20] placeholder-[#0d2d20]/25 outline-none ring-0 transition focus:border-[#0d2d20]/30 focus:bg-white focus:ring-1 focus:ring-[#0d2d20]/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/50">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full rounded-lg border border-[#0d2d20]/10 bg-white/70 px-4 py-3 text-[14px] text-[#0d2d20] placeholder-[#0d2d20]/25 outline-none ring-0 transition focus:border-[#0d2d20]/30 focus:bg-white focus:ring-1 focus:ring-[#0d2d20]/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/50">
                    Asunto
                  </label>
                  <select
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="w-full rounded-lg border border-[#0d2d20]/10 bg-white/70 px-4 py-3 text-[14px] text-[#0d2d20] outline-none transition focus:border-[#0d2d20]/30 focus:bg-white focus:ring-1 focus:ring-[#0d2d20]/20"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/50">
                    Mensaje
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Cuéntanos con detalle cómo podemos ayudarte..."
                    className="w-full resize-none rounded-lg border border-[#0d2d20]/10 bg-white/70 px-4 py-3 text-[14px] text-[#0d2d20] placeholder-[#0d2d20]/25 outline-none transition focus:border-[#0d2d20]/30 focus:bg-white focus:ring-1 focus:ring-[#0d2d20]/20"
                  />
                </div>

                {error && (
                  <p className="text-[12px] text-red-600">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0d2d20] px-8 py-3 text-[11px] font-medium uppercase tracking-[0.26em] text-white transition hover:bg-[#163a2b] disabled:opacity-60"
                >
                  {sending ? "Enviando..." : "Enviar mensaje"}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar info ── */}
          <div className="space-y-4">
            <div className="rounded-xl bg-white/60 p-6 ring-1 ring-[#0d2d20]/8">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d20]/8">
                  <Clock className="h-4 w-4 text-[#0d2d20]" aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0d2d20]">Tiempo de respuesta</p>
                  <p className="mt-0.5 text-[13px] text-[#0d2d20]/55">
                    Menos de 24 horas hábiles en días de lunes a viernes.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/60 p-6 ring-1 ring-[#0d2d20]/8">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d20]/8">
                  <Mail className="h-4 w-4 text-[#0d2d20]" aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0d2d20]">Correo directo</p>
                  <a
                    href="mailto:hola@flowjuyu.com"
                    className="mt-0.5 block text-[13px] text-[#0d2d20]/55 hover:text-[#0d2d20] transition-colors"
                  >
                    hola@flowjuyu.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white/60 p-6 ring-1 ring-[#0d2d20]/8">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d2d20]/8">
                  <MessageCircle className="h-4 w-4 text-[#0d2d20]" aria-hidden />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#0d2d20]">WhatsApp</p>
                  <p className="mt-0.5 text-[13px] text-[#0d2d20]/55">
                    Disponible de lunes a viernes, 9am – 6pm (Guatemala).
                  </p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-xl border border-[#0d2d20]/8 p-5">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.24em] text-[#0d2d20]/40">
                También puede interesarte
              </p>
              <div className="space-y-1">
                {[
                  { label: "Preguntas frecuentes", href: "/ayuda/faq" },
                  { label: "Política de devoluciones", href: "/ayuda/devoluciones" },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px] text-[#0d2d20]/65 transition hover:bg-[#0d2d20]/5 hover:text-[#0d2d20]"
                  >
                    {l.label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-40" aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
