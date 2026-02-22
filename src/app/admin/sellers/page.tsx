"use client";

import { Suspense } from "react";
import AdminSellersContent from "./AdminSellersContent";

export default function AdminSellersPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando vendedores...</div>}>
      <AdminSellersContent />
    </Suspense>
  );
}