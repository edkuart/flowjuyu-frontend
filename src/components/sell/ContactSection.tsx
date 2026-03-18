"use client";

import { useState } from "react";
import { token, Eyebrow, SectionHeading } from "./shared";

export default function ContactSection() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "seller_interest",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {

      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          subject: "Contacto desde Flowjuyu",
          name: form.name,
          email: form.email,
          message: form.message,
          type: form.type
        })
      });

      setSent(true);

    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  return (
    <section
      style={{
        background: token.bgAlt,
        padding: "clamp(72px, 10vw, 140px) 0"
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "0 clamp(20px, 5vw, 72px)",
          display: "flex",
          flexDirection: "column",
          gap: 40
        }}
      >

        <div style={{ textAlign: "center" }}>
          <Eyebrow>Contacto</Eyebrow>
          <SectionHeading>
            ¿Tienes preguntas o quieres vender en Flowjuyu?
          </SectionHeading>
        </div>

        {sent ? (
          <p
            style={{
              textAlign: "center",
              fontFamily: "'Lato', sans-serif",
              fontSize: 15,
              color: token.muted
            }}
          >
            Gracias por tu mensaje. Nuestro equipo revisará tu solicitud
            y te contactaremos pronto.
          </p>
        ) : (

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18
            }}
          >

            <input
              name="name"
              placeholder="Nombre"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              name="email"
              placeholder="Correo electrónico"
              required
              onChange={handleChange}
              style={inputStyle}
            />

            <select
              name="type"
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="seller_interest">
                Quiero vender en Flowjuyu
              </option>
              <option value="question">
                Tengo una pregunta
              </option>
              <option value="collaboration">
                Quiero colaborar
              </option>
            </select>

            <textarea
              name="message"
              placeholder="Escribe tu mensaje"
              rows={5}
              required
              onChange={handleChange}
              style={textareaStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>

          </form>
        )}

      </div>
    </section>
  );
}

const inputStyle = {
  height: 48,
  border: `1px solid ${token.border}`,
  padding: "0 14px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  background: "white"
};

const textareaStyle = {
  border: `1px solid ${token.border}`,
  padding: "12px 14px",
  fontFamily: "'Lato', sans-serif",
  fontSize: 14,
  resize: "none" as const,
  background: "white"
};

const buttonStyle = {
  marginTop: 6,
  height: 48,
  border: "none",
  background: token.green,
  color: token.bg,
  fontFamily: "'Lato', sans-serif",
  fontSize: 13,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  cursor: "pointer"
};