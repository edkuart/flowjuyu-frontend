"use client";

/**
 * /seller/onboarding — Seller onboarding wizard
 *
 * Three steps:
 *   0 — Profile  (nombre_comercio + departamento)
 *   1 — Product  (nombre + precio + imagen opcional)
 *   2 — Success  (celebración + CTA compartir)
 *
 * Reads onboarding_state from GET /api/seller/onboarding/status on mount
 * and jumps directly to the correct step so the seller never repeats work.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import {
  getSellerOnboardingStep,
  type SellerOnboardingState,
  type SellerOnboardingStatus,
} from "@/lib/sellerOnboarding";

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTAMENTOS = [
  "Ciudad de Guatemala",
  "Sacatepéquez",
  "Chimaltenango",
  "Escuintla",
  "Santa Rosa",
  "Sololá",
  "Totonicapán",
  "Quetzaltenango",
  "Suchitepéquez",
  "Retalhuleu",
  "San Marcos",
  "Huehuetenango",
  "Quiché",
  "Baja Verapaz",
  "Alta Verapaz",
  "Petén",
  "Izabal",
  "Zacapa",
  "Chiquimula",
  "Jalapa",
  "Jutiapa",
];

// ── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: 0 | 1 | 2 }) {
  const steps = ["Tu tienda", "Primer producto", "¡Listo!"];
  return (
    <div className="mb-8 flex items-center justify-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors",
                i < current ? "bg-emerald-500 text-white" : "",
                i === current
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "",
                i > current ? "bg-gray-100 text-gray-400" : "",
              ].join(" ")}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={[
                "mt-1 text-xs whitespace-nowrap",
                i === current
                  ? "font-semibold text-indigo-600"
                  : "text-gray-400",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={[
                "mx-2 mb-4 h-0.5 w-12 transition-colors sm:w-16",
                i < current ? "bg-emerald-500" : "bg-gray-200",
              ].join(" ")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 0: Profile ───────────────────────────────────────────────────────────

function StepProfile({ onDone }: { onDone: () => void }) {
  const [subStep, setSubStep] = useState<0 | 1>(0);
  const [nombreComercio, setNombreComercio] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await apiFetch("/api/seller/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_comercio: nombreComercio.trim(),
          departamento,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any).message ?? "No se pudo guardar");
      }
      onDone();
    } catch (e: any) {
      setError(e.message ?? "Algo salió mal, intenta de nuevo");
    } finally {
      setSaving(false);
    }
  }

  if (subStep === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            ¿Cómo se llama tu negocio?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Este nombre aparecerá en tu tienda para los compradores.
          </p>
        </div>

        <input
          type="text"
          value={nombreComercio}
          onChange={(e) => setNombreComercio(e.target.value)}
          placeholder="Ej: Tejidos María de Comalapa"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          maxLength={100}
          autoFocus
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={() => {
            if (nombreComercio.trim().length < 2) {
              setError("Escribe al menos 2 caracteres");
              return;
            }
            setError("");
            setSubStep(1);
          }}
          className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          Continuar →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setSubStep(0)}
          className="mb-3 flex items-center gap-1 text-sm text-indigo-600"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          ¿En qué departamento estás?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Ayuda a los compradores a encontrarte.
        </p>
      </div>

      <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto pr-1">
        {DEPARTAMENTOS.map((dep) => (
          <button
            key={dep}
            onClick={() => setDepartamento(dep)}
            className={[
              "rounded-lg border px-3 py-2 text-left text-sm transition",
              departamento === dep
                ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-700"
                : "border-gray-200 text-gray-700 hover:border-gray-400",
            ].join(" ")}
          >
            {dep}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!departamento || saving}
        className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Continuar →"}
      </button>
    </div>
  );
}

// ── Step 1: Product ───────────────────────────────────────────────────────────

function StepProduct({ onDone }: { onDone: () => void }) {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("La foto es muy grande. Usa una imagen menor a 8 MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (nombre.trim().length < 2) {
      setError("Escribe el nombre del producto (mínimo 2 caracteres)");
      return;
    }
    const precioNum = parseFloat(precio);
    if (!precio || isNaN(precioNum) || precioNum <= 0) {
      setError("Ingresa un precio válido en quetzales");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const body = new FormData();
      body.append("nombre", nombre.trim());
      body.append("precio", String(precioNum));
      if (imageFile) body.append("imagen", imageFile);

      const res = await apiFetch("/api/seller/onboarding/product-draft", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // 409 = already submitted — move forward anyway
        if (res.status === 409) {
          onDone();
          return;
        }
        throw new Error(
          (data as any).message ?? "Error al guardar el producto",
        );
      }

      onDone();
    } catch (e: any) {
      setError(e.message ?? "Algo salió mal. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Publica tu primer producto
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Solo 3 datos para empezar. Puedes editar todo después.
        </p>
      </div>

      {/* Foto */}
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          Foto del producto{" "}
          <span className="font-normal text-gray-400">(opcional)</span>
        </p>
        {imagePreview ? (
          <div className="relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Vista previa"
              className="h-48 w-full object-cover"
            />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute top-2 right-2 rounded-full bg-white px-2 py-1 text-xs text-gray-700 shadow transition hover:bg-gray-100"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-40 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition hover:border-indigo-400 hover:text-indigo-400"
          >
            <span className="mb-2 text-3xl">📷</span>
            <span className="text-sm">Toca para agregar una foto</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Nombre */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Nombre del producto
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Corte típico de Chichicastenango"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          maxLength={255}
        />
      </div>

      {/* Precio */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Precio en quetzales
        </label>
        <div className="relative">
          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-semibold text-gray-500 select-none">
            Q
          </span>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
            className="w-full rounded-xl border border-gray-300 py-3 pr-4 pl-8 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
      >
        {submitting ? "Publicando…" : "Publicar mi producto →"}
      </button>
    </div>
  );
}

// ── Step 2: Success ───────────────────────────────────────────────────────────

function StepSuccess() {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center">
      <div className="text-6xl">🎉</div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          ¡Tu producto está en Flowjuyu!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Estamos revisando tu perfil. Cuando esté aprobado, tu producto
          aparecerá publicado y los compradores podrán encontrarlo.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
        <strong>¿Qué sigue?</strong> Completa tu perfil y agrega más productos
        mientras revisamos tu cuenta. Te avisamos por WhatsApp cuando esté
        lista.
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push("/seller/dashboard")}
          className="w-full rounded-xl bg-indigo-600 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          Ir a mi dashboard
        </button>
        <button
          onClick={() => router.push("/seller/metrics")}
          className="w-full rounded-xl border border-gray-300 bg-white py-3 text-base font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          Ver métricas
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SellerOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [onboardingState, setOnboardingState] =
    useState<SellerOnboardingState | null>(null);

  useEffect(() => {
    apiFetch("/api/seller/onboarding/status")
      .then((r) => {
        if (!r.ok) return null;
        return r.json() as Promise<SellerOnboardingStatus>;
      })
      .then((data) => {
        if (!data) return;
        setOnboardingState(data.onboarding_state);
        const mapped = getSellerOnboardingStep(data.onboarding_state);
        setStep(mapped);
      })
      .catch(() => {
        // If status fetch fails, start from step 0
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 rounded-[28px] border border-indigo-100 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-indigo-500 uppercase">
                Seller onboarding
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Activa tu tienda sin invadir el resto del dashboard
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
                Este flujo vive en su propia ruta. Si entras a métricas o al
                dashboard general, ya no te vamos a redirigir aquí
                silenciosamente.
              </p>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
              Estado actual:{" "}
              <span className="font-semibold">
                {onboardingState ?? "NEW_USER"}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {/* Flowjuyu wordmark */}
          <div className="mb-6 text-center">
            <span className="text-lg font-bold tracking-tight text-indigo-600">
              Flowjuyu
            </span>
            <p className="mt-0.5 text-xs text-gray-400">
              Panel del vendedor — Configuración inicial
            </p>
          </div>

          <Stepper current={step} />

          {step === 0 && <StepProfile onDone={() => setStep(1)} />}

          {step === 1 && <StepProduct onDone={() => setStep(2)} />}

          {step === 2 && <StepSuccess />}
        </div>
      </div>
    </div>
  );
}
