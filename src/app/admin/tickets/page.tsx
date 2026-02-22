"use client";

import { Suspense } from "react";
import AdminTicketsContent from "./AdminTicketsContent";

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando tickets...</div>}>
      <AdminTicketsContent />
    </Suspense>
  );
}