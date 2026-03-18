// src/app/support/tickets/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/tickets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTickets);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Tickets de Soporte</h1>
      <p className="opacity-70 mb-6">Gestión de problemas y consultas</p>

      <div className="space-y-4">
        {tickets.map((t: any) => (
          <div
            key={t.id}
            className="border p-4 rounded-md shadow-sm bg-white flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{t.asunto}</h2>
              <p className="text-sm opacity-70">{t.mensaje}</p>
              <p className="text-xs mt-1">
                Usuario: {t.User?.correo} — Estado:{" "}
                <span className="font-medium">{t.estado}</span>
              </p>
            </div>

            <Link
              href={`/support/tickets/${t.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Ver
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
