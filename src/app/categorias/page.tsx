"use client";

import { Suspense } from "react";
import CategoriaContent from "./CategoriaContent";

export default function CategoriaPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Cargando categoría...</div>}>
      <CategoriaContent />
    </Suspense>
  );
}