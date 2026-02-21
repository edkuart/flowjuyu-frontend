"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  sellerId: number;
}

export default function SellerKYCPanel({ sellerId }: Props) {
  const [checks, setChecks] = useState({
    dpi_legible: false,
    selfie_coincide: false,
    datos_coinciden: false,
    comercio_legitimo: false,
    ubicacion_coherente: false,
  });

  const [loading, setLoading] = useState(false);

  const score = useMemo(() => {
    const total = Object.values(checks).filter(Boolean).length;
    return Math.round((total / 5) * 100);
  }, [checks]);

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

  const toggle = (key: keyof typeof checks) => {
    setChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const saveReview = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sellers/${sellerId}/kyc-review`,
        {
          method: "PATCH",
          credentials: "include", // 🔥 usamos cookies httpOnly
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checks),
        }
      );

      if (!res.ok) throw new Error("Error guardando revisión");

      alert("Revisión KYC guardada correctamente");
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

        <div className="space-y-3 text-sm">
          {Object.keys(checks).map((key) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={checks[key as keyof typeof checks]}
                onChange={() => toggle(key as keyof typeof checks)}
                className="h-4 w-4"
              />
              <span className="capitalize">
                {key.replaceAll("_", " ")}
              </span>
            </label>
          ))}
        </div>

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