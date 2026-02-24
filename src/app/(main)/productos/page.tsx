"use client";

import { Suspense } from "react";
import ProductosContent from "./ProductosContent";

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando productos...</div>}>
      <ProductosContent />
    </Suspense>
  );
}