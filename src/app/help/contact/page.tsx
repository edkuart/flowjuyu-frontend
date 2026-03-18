"use client";

import { useState } from "react";

export default function ContactPage() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    type: "question"
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
          subject: "Contacto desde página de contacto",
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
    <main className="bg-[#f6f2ea] min-h-screen">

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-16 space-y-12">

        {/* Header */}

        <header className="space-y-2 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-[#0f2e22]">
            Contáctanos
          </h1>

          <p className="text-[#6b6358] text-sm md:text-base max-w-md mx-auto">
            Si tienes preguntas sobre Flowjuyu, quieres vender tus textiles
            o explorar una colaboración, estaremos encantados de escucharte.
          </p>
        </header>

        {/* Form */}

        {sent ? (

          <div className="bg-white border rounded-xl p-8 text-center space-y-3">

            <h2 className="text-lg font-semibold text-[#0f2e22]">
              Gracias por tu mensaje
            </h2>

            <p className="text-sm text-[#6b6358]">
              Hemos recibido tu mensaje y nuestro equipo te responderá pronto.
            </p>

          </div>

        ) : (

          <form
            onSubmit={handleSubmit}
            className="bg-white border rounded-xl p-8 space-y-5"
          >

            <div>
              <label className="block text-sm font-medium text-[#0f2e22]">
                Nombre
              </label>

              <input
                name="name"
                required
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f2e22]">
                Correo electrónico
              </label>

              <input
                name="email"
                type="email"
                required
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f2e22]">
                Tipo de mensaje
              </label>

              <select
                name="type"
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              >
                <option value="question">Tengo una pregunta</option>
                <option value="seller_interest">Quiero vender en Flowjuyu</option>
                <option value="collaboration">Quiero colaborar</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f2e22]">
                Mensaje
              </label>

              <textarea
                name="message"
                rows={5}
                required
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0f2e22] text-white px-6 py-3 rounded-md text-sm uppercase tracking-wide hover:bg-[#184c37] transition"
            >
              {loading ? "Enviando..." : "Enviar mensaje"}
            </button>

          </form>

        )}

        {/* Alternative contact */}

        <section className="border rounded-xl bg-white p-6 space-y-2 text-center">

          <h2 className="text-lg font-semibold text-[#0f2e22]">
            Otras formas de contacto
          </h2>

          <p className="text-sm text-[#6b6358]">
            📧 flowjuyu@gmail.com
          </p>

          <p className="text-xs text-[#6b6358]/70">
            También puedes escribirnos directamente si lo prefieres.
          </p>

        </section>

      </div>

    </main>
  );
}