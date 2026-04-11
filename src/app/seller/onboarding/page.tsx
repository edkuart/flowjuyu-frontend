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

// ── Types ────────────────────────────────────────────────────────────────────

type OnboardingState =
  | "NEW_USER"
  | "SELLER_REGISTERED"
  | "PROFILE_STARTED"
  | "FIRST_PRODUCT_STARTED"
  | "FIRST_PRODUCT_PUBLISHED"
  | "ACTIVATED";

interface OnboardingStatus {
  onboarding_state: OnboardingState;
  checklist: {
    profile_completed: boolean;
    first_product_submitted: boolean;
    profile_photo_uploaded: boolean;
    whatsapp_linked: boolean;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const DEPARTAMENTOS = [
  "Ciudad de Guatemala", "Sacatepéquez", "Chimaltenango", "Escuintla",
  "Santa Rosa", "Sololá", "Totonicapán", "Quetzaltenango", "Suchitepéquez",
  "Retalhuleu", "San Marcos", "Huehuetenango", "Quiché", "Baja Verapaz",
  "Alta Verapaz", "Petén", "Izabal", "Zacapa", "Chiquimula", "Jalapa", "Jutiapa",
];

// ── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: 0 | 1 | 2 }) {
  const steps = ["Tu tienda", "Primer producto", "¡Listo!"];
  return (
    <div className="flex items-center justify-center mb-8 gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                i < current  ? "bg-emerald-500 text-white" : "",
                i === current ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "",
                i > current  ? "bg-gray-100 text-gray-400" : "",
              ].join(" ")}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={[
                "text-xs mt-1 whitespace-nowrap",
                i === current ? "text-indigo-600 font-semibold" : "text-gray-400",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={[
                "h-0.5 w-12 sm:w-16 mx-2 mb-4 transition-colors",
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
          <p className="text-sm text-gray-500 mt-1">
            Este nombre aparecerá en tu tienda para los compradores.
          </p>
        </div>

        <input
          type="text"
          value={nombreComercio}
          onChange={(e) => setNombreComercio(e.target.value)}
          placeholder="Ej: Tejidos María de Comalapa"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={100}
          autoFocus
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          onClick={() => {
            if (nombreComercio.trim().length < 2) {
              setError("Escribe al menos 2 caracteres");
              return;
            }
            setError("");
            setSubStep(1);
          }}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition"
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
          className="text-indigo-600 text-sm mb-3 flex items-center gap-1"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-bold text-gray-900">
          ¿En qué departamento estás?
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Ayuda a los compradores a encontrarte.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
        {DEPARTAMENTOS.map((dep) => (
          <button
            key={dep}
            onClick={() => setDepartamento(dep)}
            className={[
              "px-3 py-2 rounded-lg border text-sm text-left transition",
              departamento === dep
                ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold"
                : "border-gray-200 text-gray-700 hover:border-gray-400",
            ].join(" ")}
          >
            {dep}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={!departamento || saving}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base disabled:opacity-50 hover:bg-indigo-700 active:scale-[0.98] transition"
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
        if (res.status === 409) { onDone(); return; }
        throw new Error((data as any).message ?? "Error al guardar el producto");
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
        <p className="text-sm text-gray-500 mt-1">
          Solo 3 datos para empezar. Puedes editar todo después.
        </p>
      </div>

      {/* Foto */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Foto del producto{" "}
          <span className="text-gray-400 font-normal">(opcional)</span>
        </p>
        {imagePreview ? (
          <div className="relative rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Vista previa"
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs text-gray-700 shadow hover:bg-gray-100 transition"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition"
          >
            <span className="text-3xl mb-2">📷</span>
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
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Nombre del producto
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Corte típico de Chichicastenango"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={255}
        />
      </div>

      {/* Precio */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Precio en quetzales
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold select-none">
            Q
          </span>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
            className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base disabled:opacity-50 hover:bg-indigo-700 active:scale-[0.98] transition"
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
    <div className="text-center space-y-6">
      <div className="text-6xl">🎉</div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          ¡Tu producto está en Flowjuyu!
        </h2>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          Estamos revisando tu perfil. Cuando esté aprobado, tu producto
          aparecerá publicado y los compradores podrán encontrarlo.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm text-left">
        <strong>¿Qué sigue?</strong> Completa tu perfil y agrega más productos
        mientras revisamos tu cuenta. Te avisamos por WhatsApp cuando esté lista.
      </div>

      <div className="space-y-3">
        <button
          onClick={() => router.push("/seller/my-business")}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 active:scale-[0.98] transition"
        >
          Ir a mi tienda
        </button>
        <button
          onClick={() => router.push("/seller/dashboard")}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-base hover:bg-gray-50 active:scale-[0.98] transition"
        >
          Ver mi panel
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SellerOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2>(0);

  // Map onboarding_state → step
  function stateToStep(state: OnboardingState): 0 | 1 | 2 {
    switch (state) {
      case "FIRST_PRODUCT_PUBLISHED":
      case "ACTIVATED":
        return 2;
      case "PROFILE_STARTED":
      case "FIRST_PRODUCT_STARTED":
        return 1;
      default:
        return 0;
    }
  }

  useEffect(() => {
    apiFetch("/api/seller/onboarding/status")
      .then((r) => {
        if (!r.ok) return null;
        return r.json() as Promise<OnboardingStatus>;
      })
      .then((data) => {
        if (!data) return;
        const mapped = stateToStep(data.onboarding_state);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">

        {/* Flowjuyu wordmark */}
        <div className="text-center mb-6">
          <span className="text-lg font-bold text-indigo-600 tracking-tight">
            Flowjuyu
          </span>
          <p className="text-xs text-gray-400 mt-0.5">
            Panel del vendedor — Configuración inicial
          </p>
        </div>

        <Stepper current={step} />

        {step === 0 && (
          <StepProfile onDone={() => setStep(1)} />
        )}

        {step === 1 && (
          <StepProduct onDone={() => setStep(2)} />
        )}

        {step === 2 && <StepSuccess />}

      </div>
    </div>
  );
}
