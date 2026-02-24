"use client";

import { Suspense } from "react";
import RestablecerPasswordContent from "./RestablecerPasswordContent";

export default function RestablecerPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Cargando...</div>}>
      <RestablecerPasswordContent />
    </Suspense>
  );
}