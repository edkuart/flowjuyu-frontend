"use client";

import React from "react";
import { token, Eyebrow, SectionHeading, IconUserLine, IconCamera, IconShoppingBag } from "./shared";

type Step = { Icon: () => React.ReactElement; title: string; desc: string };

const STEPS: Step[] = [
  { Icon: IconUserLine,    title: "Crea tu cuenta",       desc: "Regístrate como vendedor y personaliza tu perfil con tu historia, comunidad de origen y estilo de tejido. Los compradores podrán conocerte antes de comprar." },
  { Icon: IconCamera,      title: "Publica tus textiles", desc: "Sube fotos de cada pieza, establece tu precio y describe la técnica y los materiales. Tu catálogo queda visible de inmediato en Flowjuyu." },
  { Icon: IconShoppingBag, title: "Recibe pedidos",       desc: "Los compradores descubren tu tienda y hacen sus pedidos. Tú recibes el pago directo — sin intermediarios innecesarios." },
];

export default function HowItWorks() {
  return (
    <section style={{ background: token.bgAlt, padding: "clamp(64px, 10vw, 128px) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 72px)" }}>

        <div className="fj-steps-header">
          <div>
            <Eyebrow>Proceso</Eyebrow>
            <SectionHeading>Cómo funciona</SectionHeading>
          </div>
          <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, color: token.muted, fontWeight: 300, maxWidth: 320, lineHeight: 1.7, margin: 0 }}>
            Comienza a vender tus textiles en tres pasos sencillos.
          </p>
        </div>

        {/* Steps grid — 3 col desktop, 1 col mobile via .fj-steps-grid */}
        <div className="fj-steps-grid">
          {STEPS.map((step, i) => {
            const StepIcon = step.Icon;
            return (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 20, background: token.bg, padding: "clamp(24px, 4vw, 48px)" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 600, color: token.green, lineHeight: 1, opacity: 0.1 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ width: 40, height: 40, borderRadius: "50%", border: `1px solid ${token.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: token.greenMid, flexShrink: 0 }}>
                    <StepIcon />
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase" as const, fontWeight: 700, color: token.sand, margin: 0 }}>
                    Paso {i + 1}
                  </p>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: token.green, lineHeight: 1.2, margin: 0 }}>
                    {step.title}
                  </h3>
                </div>
                <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 14, lineHeight: 1.75, color: token.muted, fontWeight: 300, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}