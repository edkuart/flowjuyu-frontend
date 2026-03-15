"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { token, Eyebrow, IconArrow } from "./shared";
import { fadeUp, staggerContainer, buttonHover } from "@/lib/motion";

// Honest pilot-phase signals replacing fake statistics
const PILOT_SIGNALS = [
  { label: "Plataforma en fase piloto" },
  { label: "Buscando artesanos fundadores" },
  { label: "Primeras tiendas en proceso" },
];

export default function HeroSell() {
  return (
    <section
      className="fj-hero-section"
      style={{ position: "relative", background: token.green }}
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 72px)"
        }}
      >
        <div className="fj-hero-grid">

          {/* Headline */}
          <motion.div variants={fadeUp}>
            <Eyebrow>Para artesanos de Guatemala</Eyebrow>

            <h1
              className="fj-hero-h1"
              style={{
                fontFamily: "'Cormorant Garamond', 'Georgia', serif",
                fontWeight: 600,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                color: token.bg,
                margin: 0
              }}
            >
              Comparte tu<br />
              <em style={{ color: token.sand, fontStyle: "italic" }}>
                tradición
              </em><br />
              con el mundo
            </h1>
          </motion.div>

          {/* Right column */}
          <motion.div
            variants={fadeUp}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              paddingBottom: 6
            }}
          >

            <p
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 15,
                lineHeight: 1.8,
                fontWeight: 300,
                color: "rgba(246,242,234,0.65)",
                margin: 0
              }}
            >
              Flowjuyu es una plataforma creada para dar visibilidad a
              artesanos textiles guatemaltecos.
              <br /><br />
              Crea tu perfil, muestra tus piezas y conecta con personas que
              valoran la artesanía. Durante esta fase piloto, Flowjuyu funciona
              como un catálogo donde los compradores pueden descubrir tu
              trabajo y contactarte directamente.
            </p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12
              }}
            >
              <motion.div {...buttonHover}>
                <Link
                  href="/register/seller"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    height: 48,
                    padding: "0 26px",
                    borderRadius: 4,
                    background: token.bg,
                    color: token.green,
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase" as const,
                    textDecoration: "none"
                  }}
                >
                  Crear mi tienda <IconArrow />
                </Link>
              </motion.div>

              <Link
                href="/help/contact"
                style={{
                  fontFamily: "'Lato', sans-serif",
                  fontSize: 13,
                  color: "rgba(246,242,234,0.45)",
                  textDecoration: "none",
                  letterSpacing: "0.04em"
                }}
              >
                Hablar con nosotros
              </Link>
            </motion.div>

            {/* Pilot signals */}
            <motion.div
              variants={staggerContainer}
              className="fj-pilot-row"
            >
              {PILOT_SIGNALS.map((s) => (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: token.sand,
                      flexShrink: 0,
                      opacity: 0.7
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 12,
                      color: "rgba(246,242,234,0.45)",
                      letterSpacing: "0.03em"
                    }}
                  >
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}