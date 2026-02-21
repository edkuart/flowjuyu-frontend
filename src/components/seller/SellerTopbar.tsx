"use client";

import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

type Props = {
  businessName?: string;
  status?: "activo" | "inactivo" | "suspendido";
};

export default function SellerTopbar({
  businessName = "Mi negocio",
  status = "activo",
}: Props) {

  const statusColor =
    status === "activo"
      ? "bg-emerald-100 text-emerald-700"
      : status === "suspendido"
      ? "bg-red-100 text-red-700"
      : "bg-zinc-100 text-zinc-700";

  return (
    <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">

      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">
            {businessName}
          </h1>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
          >
            Negocio {status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 border rounded-lg hover:bg-zinc-50"
        >
          <ExternalLink className="w-4 h-4" />
          Ver tienda pública
        </Link>

        <Link
          href="/seller/products/create"
          className="inline-flex items-center gap-2 text-sm px-3 py-2 bg-zinc-900 text-white rounded-lg hover:bg-black"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </Link>

      </div>
    </div>
  );
}