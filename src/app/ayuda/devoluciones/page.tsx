import Link from "next/link";
import { RotateCcw, Clock, ShieldCheck, AlertCircle, MessageCircle } from "lucide-react";

export default function DevolucionesPage() {
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
            Devoluciones y reembolsos
          </h1>
          <p className="max-w-lg text-[15px] leading-relaxed text-white/55">
            Nuestra política está diseñada para protegerte como comprador y respetar el trabajo de nuestros artesanos.
          </p>
          <div className="h-px w-16 bg-gradient-to-r from-[#d4a853] to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-6 py-14">

        {/* ── Key facts ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Clock,
              title: "7 días",
              desc: "Plazo para solicitar devolución desde que recibes tu pedido.",
            },
            {
              icon: ShieldCheck,
              title: "Compra protegida",
              desc: "Tu pago está retenido hasta que confirmas la recepción.",
            },
            {
              icon: RotateCcw,
              title: "Reembolso completo",
              desc: "Si el producto tiene defecto o no coincide con la descripción.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl bg-white/60 p-5 ring-1 ring-[#0d2d20]/8"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0d2d20]/8">
                <Icon className="h-4 w-4 text-[#0d2d20]" aria-hidden />
              </div>
              <div>
                <p className="font-serif italic text-[1.2rem] text-[#0d2d20]">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#0d2d20]/55">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Policy sections ── */}
        <div className="space-y-8">

          {/* Cuándo aplica */}
          <div className="rounded-xl bg-white/60 p-7 ring-1 ring-[#0d2d20]/8">
            <h2 className="font-serif italic text-[1.4rem] text-[#0d2d20]">
              ¿Cuándo puedo solicitar una devolución?
            </h2>
            <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#0d2d20]/65">
              <p>Aceptamos solicitudes de devolución en los siguientes casos:</p>
              <ul className="ml-4 list-disc space-y-2">
                <li>El producto llegó dañado o con defectos de fabricación.</li>
                <li>El artículo recibido no corresponde a lo descrito en la publicación (talla, color, material).</li>
                <li>El pedido llegó incompleto.</li>
                <li>No recibiste tu pedido dentro del plazo máximo de entrega.</li>
              </ul>
            </div>
          </div>

          {/* No aplica */}
          <div className="rounded-xl border border-[#d4a853]/30 bg-[#d4a853]/5 p-7">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#d97706]" aria-hidden />
              <div>
                <h2 className="font-medium text-[14px] text-[#0d2d20]">
                  Casos donde no aplica devolución
                </h2>
                <ul className="mt-3 ml-4 list-disc space-y-2 text-[14px] leading-relaxed text-[#0d2d20]/65">
                  <li>El cliente cambió de opinión después de recibir el pedido.</li>
                  <li>El producto fue descrito correctamente pero no cumplió expectativas estéticas subjetivas.</li>
                  <li>El plazo de 7 días ya venció.</li>
                  <li>El artículo fue personalizado o confeccionado a medida.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Proceso */}
          <div className="rounded-xl bg-white/60 p-7 ring-1 ring-[#0d2d20]/8">
            <h2 className="font-serif italic text-[1.4rem] text-[#0d2d20]">
              ¿Cómo solicito una devolución?
            </h2>
            <ol className="mt-5 space-y-5">
              {[
                {
                  n: "01",
                  title: "Fotografía el producto",
                  desc: "Toma fotos claras del artículo y del empaque antes de cualquier manipulación adicional.",
                },
                {
                  n: "02",
                  title: "Contáctanos dentro de los 7 días",
                  desc: "Escríbenos a través de nuestra página de contacto o al correo hola@flowjuyu.com con las fotos y el número de pedido.",
                },
                {
                  n: "03",
                  title: "Revisamos tu caso",
                  desc: "Nuestro equipo evalúa la solicitud en un plazo máximo de 3 días hábiles y te notificamos la resolución.",
                },
                {
                  n: "04",
                  title: "Coordinar el retiro",
                  desc: "Si se aprueba, coordinamos la logística de devolución. El retiro es sin costo para el comprador en casos de defecto o error.",
                },
                {
                  n: "05",
                  title: "Reembolso",
                  desc: "Una vez confirmada la devolución física, el reembolso se procesa en 5 a 10 días hábiles al método de pago original.",
                },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-5">
                  <span className="mt-0.5 font-mono text-[11px] tracking-[0.22em] text-[#d4a853]">
                    {n}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-[#0d2d20]">{title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[#0d2d20]/55">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Reembolsos */}
          <div className="rounded-xl bg-white/60 p-7 ring-1 ring-[#0d2d20]/8">
            <h2 className="font-serif italic text-[1.4rem] text-[#0d2d20]">
              Tiempos de reembolso
            </h2>
            <div className="mt-4 space-y-3 text-[14px] leading-relaxed text-[#0d2d20]/65">
              <p>
                Una vez aprobada la devolución y recibido el artículo, procesamos el reembolso al método de pago original:
              </p>
              <div className="mt-4 divide-y divide-[#0d2d20]/8 rounded-lg border border-[#0d2d20]/8 overflow-hidden">
                {[
                  ["Tarjeta de crédito / débito", "5–10 días hábiles"],
                  ["Efectivo (agente)", "3–5 días hábiles"],
                ].map(([method, time]) => (
                  <div key={method} className="flex items-center justify-between px-4 py-3">
                    <span className="text-[#0d2d20]/70">{method}</span>
                    <span className="font-medium text-[#0d2d20]">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="rounded-xl bg-[#0d2d20] p-8 text-white">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-white/40">
            <span className="mr-2 text-[#d4a853]" aria-hidden>✦</span>
            ¿Necesitas ayuda con un pedido?
          </p>
          <h3 className="mt-3 font-serif italic text-[1.75rem] leading-tight">
            Nuestro equipo te ayuda
          </h3>
          <p className="mt-2 text-[14px] text-white/55">
            Si tienes un problema con tu pedido, escríbenos y lo resolvemos contigo.
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
              href="/ayuda/faq"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Ver preguntas frecuentes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
