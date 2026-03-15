"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  token,
  Eyebrow,
  SectionHeading,
  IconUserLine,
  IconCamera,
  IconShoppingBag
} from "./shared";

import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

type Step = {
  Icon: () => React.ReactElement;
  title: string;
  desc: string;
};

const STEPS: Step[] = [
  {
    Icon: IconUserLine,
    title: "Crea tu cuenta",
    desc: "Regístrate como vendedor y crea tu perfil. Puedes contar tu historia, tu comunidad y el estilo de textiles que produces para que las personas conozcan quién está detrás de cada pieza."
  },
  {
    Icon: IconCamera,
    title: "Publica tus textiles",
    desc: "Sube fotos de tus piezas, describe los materiales y las técnicas utilizadas. Tu catálogo quedará visible dentro de Flowjuyu para que más personas descubran tu trabajo."
  },
  {
    Icon: IconShoppingBag,
    title: "Conecta con compradores",
    desc: "Las personas interesadas podrán descubrir tu trabajo dentro de la plataforma y contactarte directamente para conocer más sobre tus textiles."
  }
];

export default function HowItWorks() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      style={{
        background: token.bgAlt,
        padding: "clamp(64px, 10vw, 128px) 0"
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 72px)"
        }}
      >

        <motion.div
          variants={fadeUp}
          className="fj-steps-header"
        >
          <div>
            <Eyebrow>Proceso</Eyebrow>
            <SectionHeading>Cómo funciona</SectionHeading>
          </div>

          <p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontSize: 14,
              color: token.muted,
              fontWeight: 300,
              maxWidth: 320,
              lineHeight: 1.7,
              margin: 0
            }}
          >
            Comienza a mostrar tus textiles y conectar con personas interesadas en tres pasos sencillos.
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="fj-steps-grid"
        >
          {STEPS.map((step, i) => {
            const StepIcon = step.Icon;

            return (
              <motion.div
                key={i}
                variants={fadeUp}
                {...cardHover}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  background: token.bg,
                  padding: "clamp(24px, 4vw, 48px)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 44,
                      fontWeight: 600,
                      color: token.green,
                      lineHeight: 1,
                      opacity: 0.1
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      border: `1px solid ${token.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: token.greenMid,
                      flexShrink: 0
                    }}
                  >
                    <StepIcon />
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <p
                    style={{
                      fontFamily: "'Lato', sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase" as const,
                      fontWeight: 700,
                      color: token.sand,
                      margin: 0
                    }}
                  >
                    Paso {i + 1}
                  </p>

                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 21,
                      fontWeight: 600,
                      color: token.green,
                      lineHeight: 1.2,
                      margin: 0
                    }}
                  >
                    {step.title}
                  </h3>
                </div>

                <p
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.75,
                    color: token.muted,
                    fontWeight: 300,
                    margin: 0
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </motion.section>
  );
}