"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  token,
  Eyebrow,
  SectionHeading,
  Rule,
  IconChevronDown,
  IconArrow
} from "./shared";

import { fadeUp, staggerContainer } from "@/lib/motion";

const FAQS = [
  {
    q: "¿Necesito experiencia en tecnología?",
    a: "No. Flowjuyu está diseñado para que cualquier artesano pueda usarlo con facilidad. Solo necesitas un teléfono o computadora para publicar tus textiles y gestionar tu perfil."
  },
  {
    q: "¿Cómo funciona Flowjuyu actualmente?",
    a: "Actualmente Flowjuyu se encuentra en fase piloto. La plataforma funciona como un catálogo donde las personas pueden descubrir tu trabajo y contactarte directamente para conocer más sobre tus textiles."
  },
  {
    q: "¿Puedo vender desde cualquier región de Guatemala?",
    a: "Sí. Flowjuyu está disponible para artesanos en todo el territorio guatemalteco. Solo necesitas acceso a internet para administrar tu perfil y mostrar tus textiles."
  },
  {
    q: "¿Cómo contactan los compradores?",
    a: "Las personas interesadas pueden descubrir tu perfil dentro de Flowjuyu y ponerse en contacto contigo para obtener más información sobre tus piezas."
  },
  {
    q: "¿Qué significa ser artesano fundador?",
    a: "Estamos invitando a los primeros artesanos a formar parte de la fase piloto de Flowjuyu. Estas primeras tiendas nos ayudarán a construir y mejorar la plataforma."
  }
];

function FAQItem({
  q,
  a,
  isOpen,
  onToggle
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Rule />

      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          padding: "22px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          WebkitTapHighlightColor: "transparent"
        }}
      >
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(16px, 3vw, 19px)",
            fontWeight: 600,
            color: token.green,
            lineHeight: 1.3
          }}
        >
          {q}
        </span>

        <span style={{ color: token.muted, flexShrink: 0 }}>
          <IconChevronDown open={isOpen} />
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? 320 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(.4,0,.2,1)"
        }}
      >
        <p
          style={{
            fontFamily: "'Lato', sans-serif",
            fontSize: 14,
            lineHeight: 1.8,
            color: token.muted,
            fontWeight: 300,
            padding: "0 0 22px",
            margin: 0
          }}
        >
          {a}
        </p>
      </div>
    </motion.div>
  );
}

export default function SellerFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      style={{ background: token.bg, padding: "clamp(64px, 10vw, 128px) 0" }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 72px)"
        }}
      >

        <motion.div variants={fadeUp} className="fj-faq-header">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <SectionHeading>Preguntas frecuentes</SectionHeading>
          </div>

          <Link
            href="/help/contact"
            className="fj-faq-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "'Lato', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: token.green,
              textDecoration: "none",
              borderBottom: `1px solid ${token.green}`,
              paddingBottom: 2
            }}
          >
            Más preguntas <IconArrow />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ maxWidth: 760 }}
        >
          {FAQS.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q}
              a={f.a}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? null : i)}
            />
          ))}

          <Rule />

          <div style={{ paddingTop: 32 }}>
            <Link
              href="/help/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "'Lato', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: token.green,
                textDecoration: "none",
                borderBottom: `1px solid ${token.green}`,
                paddingBottom: 2
              }}
            >
              ¿Más preguntas? Contáctanos <IconArrow />
            </Link>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}