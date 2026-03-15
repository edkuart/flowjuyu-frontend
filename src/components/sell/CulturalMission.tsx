"use client";

import React from "react";
import { motion } from "framer-motion";
import { token, Eyebrow } from "./shared";
import { fadeUp, staggerContainer } from "@/lib/motion";

const VALUES = ["Comercio justo", "Autenticidad", "Cultura viva", "Comunidad"];

export default function CulturalMission() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      style={{ background: token.green, padding: "clamp(72px, 12vw, 160px) 0" }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 72px)"
        }}
      >
        <div className="fj-mission-grid">

          {/* Quote */}
          <motion.div variants={fadeUp}>
            <Eyebrow>Nuestra misión</Eyebrow>

            <blockquote
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(30px, 5vw, 56px)",
                fontWeight: 500,
                fontStyle: "italic",
                color: token.bg,
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                margin: 0
              }}
            >
              "Cada hilo cuenta una historia que merece ser conocida más allá de su lugar de origen."
            </blockquote>
          </motion.div>

          {/* Right column */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              paddingTop: 8
            }}
          >

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 15,
                lineHeight: 1.85,
                color: "rgba(246,242,234,0.62)",
                fontWeight: 300,
                margin: 0
              }}
            >
              Guatemala alberga una de las tradiciones textiles más ricas del
              mundo. Cada comunidad tiene sus propios colores, patrones y
              técnicas transmitidas de generación en generación.
            </motion.p>

            <motion.p
              variants={fadeUp}
              style={{
                fontFamily: "'Lato', sans-serif",
                fontSize: 15,
                lineHeight: 1.85,
                color: "rgba(246,242,234,0.62)",
                fontWeight: 300,
                margin: 0
              }}
            >
              Flowjuyu nace con la idea de crear un espacio digital donde los
              artesanos puedan mostrar su trabajo y donde más personas puedan
              descubrir el valor cultural que existe detrás de cada pieza.
              Actualmente estamos construyendo esta red junto a los primeros
              artesanos que forman parte de la plataforma.
            </motion.p>

            {/* Values */}
            <motion.div
              variants={staggerContainer}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                paddingTop: 16,
                borderTop: "1px solid rgba(246,242,234,0.1)"
              }}
            >
              {VALUES.map((v) => (
                <motion.span
                  key={v}
                  variants={fadeUp}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(246,242,234,0.4)",
                    padding: "6px 14px",
                    border: "1px solid rgba(246,242,234,0.12)",
                    borderRadius: 2
                  }}
                >
                  {v}
                </motion.span>
              ))}
            </motion.div>

            {/* Accent line */}
            <motion.div
              variants={fadeUp}
              style={{
                height: 2,
                width: 40,
                background: token.sand,
                borderRadius: 1
              }}
            />

          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}