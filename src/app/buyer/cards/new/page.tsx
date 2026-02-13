"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function NewCardPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .slice(0, 19);
  };

  const formatExp = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d{1,2})/, "$1/$2")
      .slice(0, 5);
  };

  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Tarjeta guardada (conectar backend)");
  };

  return (
    <div className="space-y-8 max-w-xl">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link
          href="/buyer/cards"
          className="text-sm text-zinc-600 hover:underline"
        >
          ← Regresar
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Agregar tarjeta</h1>
      <p className="text-muted-foreground">
        Ingresa los datos de tu tarjeta para guardarla como método de pago.
      </p>

      {/* TARJETA VISUAL */}
      <div className="rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-white p-6 shadow-lg">
        <div className="flex justify-between text-sm opacity-80">
          <span>Flowjuyu Payments</span>
          <CreditCard className="w-5 h-5" />
        </div>

        <div className="mt-6 text-xl tracking-widest font-semibold">
          {cardNumber || "•••• •••• •••• ••••"}
        </div>

        <div className="flex justify-between mt-8 text-sm opacity-90">
          <div>
            <p className="uppercase text-xs opacity-60">Titular</p>
            <p>{name || "Nombre completo"}</p>
          </div>

          <div>
            <p className="uppercase text-xs opacity-60">Exp</p>
            <p>{exp || "MM/AA"}</p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={submitCard} className="space-y-6">

        {/* Numero de tarjeta */}
        <div>
          <label className="text-sm font-medium">Número de tarjeta *</label>
          <Input
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
            className="mt-1"
          />
        </div>

        {/* Nombre del titular */}
        <div>
          <label className="text-sm font-medium">Nombre del titular *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como aparece en la tarjeta"
            required
            className="mt-1"
          />
        </div>

        {/* Exp y CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Expiración (MM/AA) *</label>
            <Input
              value={exp}
              onChange={(e) => setExp(formatExp(e.target.value))}
              placeholder="08/28"
              required
              maxLength={5}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">CVV *</label>
            <Input
              type="password"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
              }
              placeholder="•••"
              required
              maxLength={4}
              className="mt-1"
            />
          </div>
        </div>

        {/* Botón guardar */}
        <Button
          type="submit"
          className="w-full bg-zinc-900 text-white hover:bg-zinc-800"
        >
          Guardar tarjeta
        </Button>
      </form>
    </div>
  );
}
