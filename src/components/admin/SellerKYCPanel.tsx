"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authFetch } from "@/lib/authFetch";

interface Checklist {
  dpi_legible: boolean;
  selfie_coincide: boolean;
  datos_coinciden: boolean;
  comercio_legitimo: boolean;
  ubicacion_coherente: boolean;
}

interface Props {
  sellerId: number;
  initialChecklist?: Partial<Checklist> | null;

  onUpdated?: () => void;
}

export default function SellerKYCPanel({
  sellerId,
  initialChecklist,
  onUpdated,
}: Props) {
  // 🔹 Estado por defecto
  const defaultChecks: Checklist = {
    dpi_legible: false,
    selfie_coincide: false,
    datos_coinciden: false,
    comercio_legitimo: false,
    ubicacion_coherente: false,
  };

  // 🔹 State principal
  const [checks, setChecks] = useState<Checklist>({
    ...defaultChecks,
    ...initialChecklist,
  });

  const [loading, setLoading] = useState(false);

  // 🔥 IMPORTANTE: sincronizar si cambia el seller o el checklist
  useEffect(() => {
    setChecks({
      ...defaultChecks,
      ...initialChecklist,
    });
  }, [initialChecklist, sellerId]);

  // 🔹 Score dinámico
  const score = useMemo(() => {
    const total = Object.values(checks).filter(Boolean).length;
    return Math.round((total / 5) * 100);
  }, [checks]);

  // 🔹 Riesgo dinámico
  const riesgo = useMemo(() => {
    if (score >= 80) return "bajo";
    if (score >= 50) return "medio";
    return "alto";
  }, [score]);

  const riesgoColor =
    riesgo === "bajo"
      ? "bg-green-100 text-green-700"
      : riesgo === "medio"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  const toggle = (key: keyof Checklist) => {
    setChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 🔹 Guardar revisión
  const saveReview = async () => {
    try {
      setLoading(true);

      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sellers/${sellerId}/kyc-review`,
        {
          method: "PATCH",
          body: JSON.stringify(checks),
        }
      );

      if (!res.ok) throw new Error("Error guardando revisión");

      alert("Revisión KYC guardada correctamente");

      // 🔥 refrescar el seller en la página padre
      if (onUpdated) {
        onUpdated();
      }

    } catch (err) {
      console.error(err);
      alert("Error guardando revisión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8 rounded-2xl border shadow-sm">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight">
            Revisión KYC
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Evaluación manual de identidad y legitimidad del comercio.
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-3 text-sm">
          {Object.keys(defaultChecks).map((key) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checks[key as keyof Checklist]}
                onChange={() => toggle(key as keyof Checklist)}
                className="h-4 w-4"
              />
              <span className="capitalize">
                {key.replaceAll("_", " ")}
              </span>
            </label>
          ))}
        </div>

        {/* Score y riesgo */}
        <div className="flex items-center gap-6">
          <div className="text-lg font-bold">
            Score: {score}%
          </div>

          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${riesgoColor}`}
          >
            Riesgo: {riesgo}
          </div>
        </div>

        {/* Botón guardar */}
        <Button
          onClick={saveReview}
          disabled={loading}
          className="rounded-xl"
        >
          {loading ? "Guardando..." : "Guardar revisión"}
        </Button>
      </CardContent>
    </Card>
  );
}