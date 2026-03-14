"use client";

import React from "react";
import { token, Eyebrow } from "./shared";

const VALUES = ["Comercio justo", "Autenticidad", "Cultura viva", "Comunidad"];

export default function CulturalMission() {
  return (
    <section style={{ background: token.green, padding: "clamp(72px, 12vw, 160px) 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 72px)" }}>
        <div className="fj-mission-grid">

          {/* Large typographic quote */}
          <div>
            <Eyebrow>Nuestra misión</Eyebrow>
            <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px, 5vw, 56px)", fontWeight: 500, fontStyle: "italic", color: token.bg, lineHeight: 1.15, letterSpacing: "-0.01em", margin: 0 }}>
              "Cada hilo cuenta una historia que merece ser escuchada en todo el mundo."
            </blockquote>
          </div>

          {/* Body text + values */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 8 }}>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, lineHeight: 1.85, color: "rgba(246,242,234,0.62)", fontWeight: 300, margin: 0 }}>
              Guatemala alberga una de las tradiciones textiles más ricas del mundo.
              Cada comunidad tiene sus propios colores, patrones y técnicas transmitidas
              de generación en generación.
            </p>
            <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, lineHeight: 1.85, color: "rgba(246,242,234,0.62)", fontWeight: 300, margin: 0 }}>
              Flowjuyu nació para que ese patrimonio no quede limitado a los mercados
              locales. Queremos que los artesanos prosperen y que el mundo conozca y
              valore el trabajo que hay detrás de cada pieza.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 16, borderTop: "1px solid rgba(246,242,234,0.1)" }}>
              {VALUES.map((v) => (
                <span key={v} style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(246,242,234,0.4)", padding: "6px 14px", border: "1px solid rgba(246,242,234,0.12)", borderRadius: 2 }}>
                  {v}
                </span>
              ))}
            </div>

            <div style={{ height: 2, width: 40, background: token.sand, borderRadius: 1 }} />
          </div>

        </div>
      </div>
    </section>
  );
}