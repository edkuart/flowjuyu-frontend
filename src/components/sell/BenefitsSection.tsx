"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  token,
  Eyebrow,
  SectionHeading,
  BodyText,
  Rule,
  IconLaptop,
  IconPercent,
  IconTag
} from "./shared";

import { fadeUp, staggerContainer, cardHover } from "@/lib/motion";

type Benefit = {
  Icon: () => React.ReactElement;
  title: string;
  desc: string;
};

const BENEFITS: Benefit[] = [
  {
    Icon: IconLaptop,
    title: "Sin complicaciones técnicas",
    desc: "No necesitas ser experto en tecnología. La plataforma es simple e intuitiva y funciona desde tu teléfono o computadora."
  },
  {
    Icon: IconPercent,
    title: "Participa desde el inicio",
    desc: "Estamos en fase piloto buscando artesanos fundadores que quieran mostrar su trabajo y formar parte del crecimiento inicial de la plataforma."
  },
  {
    Icon: IconTag,
    title: "Construye tu propia marca",
    desc: "Tu perfil puede mostrar tu historia, tus textiles y el origen de tu trabajo para que más personas descubran tu artesanía."
  }
];

export default function BenefitsSection() {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      style={{
        background: token.bg,
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
          style={{ maxWidth: 480, marginBottom: "clamp(40px, 6vw, 64px)" }}
        >
          <Eyebrow>Beneficios</Eyebrow>
          <SectionHeading>¿Por qué unirte a Flowjuyu?</SectionHeading>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          style={{ display: "flex", flexDirection: "column" }}
        >
          {BENEFITS.map((benefit, i) => {
            const BenefitIcon = benefit.Icon;

            return (
              <motion.div key={i} variants={fadeUp}>
                <Rule />

                <motion.div
                  {...cardHover}
                  className="fj-benefit-row"
                >
                  {/* Index number */}
                  <span
                    className="fj-benefit-num"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: token.sand,
                      letterSpacing: "0.06em",
                      paddingTop: 2
                    }}
                  >
                    0{i + 1}
                  </span>

                  {/* Icon + title */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12
                    }}
                  >
                    <span
                      style={{
                        color: token.green,
                        marginTop: 2,
                        flexShrink: 0
                      }}
                    >
                      <BenefitIcon />
                    </span>

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
                      {benefit.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="fj-benefit-desc">
                    <BodyText>{benefit.desc}</BodyText>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}

          <Rule />
        </motion.div>
      </div>
    </motion.section>
  );
}