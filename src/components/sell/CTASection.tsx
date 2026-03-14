"use client";

import React from "react";
import Link from "next/link";
import { token, IconArrow } from "./shared";

export default function CTASection() {
  return (
    <section style={{ background: token.bgAlt, padding: "clamp(72px, 12vw, 160px) 0", borderTop: `1px solid ${token.border}` }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 clamp(20px, 5vw, 72px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

        {/* Vertical accent line — hidden on mobile */}
        <div
          className="fj-cta-line"
          style={{ width: 1, height: 48, background: token.sand, marginBottom: 40, opacity: 0.6 }}
        />

        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.02em", color: token.green, margin: "0 0 20px" }}>
          Tu tienda te está<br />
          <em style={{ fontStyle: "italic" }}>esperando</em>
        </h2>

        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 15, lineHeight: 1.8, color: token.muted, fontWeight: 300, maxWidth: 420, margin: "0 0 36px" }}>
          Únete a los primeros artesanos fundadores de Flowjuyu y lleva tu
          trabajo a nuevos compradores que valoran la artesanía guatemalteca.
        </p>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: "100%" }}>
          <Link
            href="/register/seller"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12, height: 50, padding: "0 32px", borderRadius: 4, background: token.green, color: token.bg, fontFamily: "'Lato', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, textDecoration: "none", width: "100%", maxWidth: 300 }}
          >
            Crear mi tienda <IconArrow />
          </Link>
          <Link
            href="/help/contact"
            style={{ fontFamily: "'Lato', sans-serif", fontSize: 13, color: token.muted, textDecoration: "none", letterSpacing: "0.04em" }}
          >
            Hablar con nosotros
          </Link>
        </div>

        <p style={{ fontFamily: "'Lato', sans-serif", fontSize: 11, color: "rgba(107,99,88,0.45)", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 36 }}>
          Registro gratuito · Sin compromisos · Soporte en español
        </p>

      </div>
    </section>
  );
}