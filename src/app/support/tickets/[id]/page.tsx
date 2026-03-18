// src/app/support/tickets/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTicket);
  }, [id]);

  const cambiarEstado = async (estado: string) => {
    const token = localStorage.getItem("token");

    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/tickets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ estado }),
    });

    router.refresh();
  };

  if (!ticket) return <p>Cargando ticket...</p>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold">{ticket.asunto}</h1>
      <p className="mt-2 text-sm opacity-80">{ticket.mensaje}</p>

      <p className="mt-4 text-sm">
        Estado actual:{" "}
        <span className="font-medium text-blue-600">{ticket.estado}</span>
      </p>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => cambiarEstado("abierto")}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          Abierto
        </button>

        <button
          onClick={() => cambiarEstado("en_proceso")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          En proceso
        </button>

        <button
          onClick={() => cambiarEstado("cerrado")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Cerrado
        </button>
      </div>

      <button onClick={() => router.back()} className="mt-6 text-blue-600">
        ← Volver
      </button>
    </div>
  );
}
