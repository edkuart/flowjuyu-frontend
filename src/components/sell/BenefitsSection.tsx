"use client";

import React from "react";
import { token, Eyebrow, SectionHeading, BodyText, Rule, IconLaptop, IconPercent, IconTag } from "./shared";

type Benefit = { Icon: () => React.ReactElement; title: string; desc: string };

const BENEFITS: Benefit[] = [
  { Icon: IconLaptop,  title: "Sin complicaciones técnicas", desc: "No necesitas ser experto en tecnología. La plataforma es simple e intuitiva — funciona desde tu teléfono o computadora." },
  { Icon: IconPercent, title: "Comisiones transparentes",    desc: "Tarifas claras del 10–15 % sin costos ocultos. Siempre sabrás exactamente cuánto recibirás por cada venta." },
  { Icon: IconTag,     title: "Construye tu propia marca",   desc: "Tu tienda tiene su propio perfil: historia, fotos y el origen de tus textiles para conectar con quienes valoran tu trabajo." },
];

export default function BenefitsSection() {
  return (
    <section style={{ background: token.bg, padding: "clamp(64px, 10vw, 128px) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 72px)" }}>

        <div style={{ maxWidth: 480, marginBottom: "clamp(40px, 6vw, 64px)" }}>
          <Eyebrow>Beneficios</Eyebrow>
          <SectionHeading>¿Por qué vender en Flowjuyu?</SectionHeading>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {BENEFITS.map((benefit, i) => {
            const BenefitIcon = benefit.Icon;
            return (
              <div key={i}>
                <Rule />
                <div className="fj-benefit-row">

                  {/* Index number — hidden on mobile via CSS class */}
                  <span
                    className="fj-benefit-num"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontWeight: 600, color: token.sand, letterSpacing: "0.06em", paddingTop: 2 }}
                  >
                    0{i + 1}
                  </span>

                  {/* Icon + title */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ color: token.green, marginTop: 2, flexShrink: 0 }}>
                      <BenefitIcon />
                    </span>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 600, color: token.green, lineHeight: 1.2, margin: 0 }}>
                      {benefit.title}
                    </h3>
                  </div>

                  {/* Description — spans to column 2 on tablet via .fj-benefit-desc */}
                  <div className="fj-benefit-desc">
                    <BodyText>{benefit.desc}</BodyText>
                  </div>

                </div>
              </div>
            );
          })}
          <Rule />
        </div>

      </div>
    </section>
  );
}