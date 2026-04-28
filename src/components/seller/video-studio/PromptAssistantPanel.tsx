"use client";

import { useRef } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import {
  AI_DECIDE_VALUE,
  buildProfessionalVideoPrompt,
  DEFAULT_VIDEO_BRIEF,
  isAiDecisionValue,
} from "@/lib/videoPromptBuilder";
import type {
  SelectedVideoAsset,
  VideoCreativeBrief,
  VideoFormat,
  VideoTemplate,
} from "@/types/video-studio";
import type { VendedorPerfil } from "@/types/db";

const STYLE_PRESETS = [
  { key: "ai_decide", label: "Que la IA decida" },
  { key: "artesanal", label: "Artesanal" },
  { key: "editorial", label: "Editorial" },
  { key: "vibrant", label: "Vibrante" },
  { key: "minimal", label: "Minimal" },
  { key: "cinematic", label: "Cine" },
];

const GOAL_OPTIONS = [
  "despertar deseo de compra",
  "explicar valor y calidad",
  "anunciar promocion",
  "invitar a live",
  "presentar coleccion",
];

const AUDIENCE_OPTIONS = [
  "clientes nuevos que descubren la tienda en redes sociales",
  "personas que buscan una pieza especial para regalar",
  "compradores que valoran textiles y trabajo artesanal",
  "clientes que ya preguntaron por precio o disponibilidad",
];

const CTA_OPTIONS = [
  "escribir por WhatsApp para consultar disponibilidad",
  "ver mas piezas en la tienda",
  "apartar la pieza antes de que se venda",
  "unirse al proximo live de ventas",
];

const CAMERA_OPTIONS = [
  "close-up de textura con movimiento lento de camara",
  "dolly suave desde detalle artesanal hacia producto completo",
  "toma cenital de mesa editorial con manos acomodando la pieza",
  "paneo lento por colores y acabados con luz natural",
  "reveal vertical del producto listo para usar",
];

interface Props {
  prompt: string;
  stylePreset: string;
  template: VideoTemplate | null;
  assets?: SelectedVideoAsset[];
  sellerProfile?: Partial<VendedorPerfil> | null;
  brief?: VideoCreativeBrief;
  format?: VideoFormat;
  durationSeconds?: number;
  onBriefChange?: (brief: VideoCreativeBrief) => void;
  onChange: (prompt: string, stylePreset: string) => void;
  onManualPromptChange?: (manual: boolean) => void;
}

export default function PromptAssistantPanel({
  prompt,
  stylePreset,
  template,
  assets = [],
  sellerProfile,
  brief = DEFAULT_VIDEO_BRIEF,
  format,
  durationSeconds,
  onBriefChange,
  onChange,
  onManualPromptChange,
}: Props) {
  const activeBrief = { ...DEFAULT_VIDEO_BRIEF, ...brief };
  const generatedPromptRef = useRef<string | null>(null);
  const manualPromptEditRef = useRef(false);

  function createPrompt(nextBrief: VideoCreativeBrief, nextStylePreset = stylePreset) {
    return buildProfessionalVideoPrompt({
      brief: nextBrief,
      assets,
      sellerProfile,
      template,
      format,
      durationSeconds,
      stylePreset: nextStylePreset,
    });
  }

  function shouldSyncPrompt() {
    return (
      !manualPromptEditRef.current &&
      (!prompt.trim() || prompt === generatedPromptRef.current || generatedPromptRef.current === null)
    );
  }

  function updateBrief(partial: Partial<VideoCreativeBrief>, nextStylePreset = stylePreset) {
    const nextBrief = { ...activeBrief, ...partial };
    onBriefChange?.(nextBrief);

    if (shouldSyncPrompt()) {
      const nextPrompt = createPrompt(nextBrief, nextStylePreset);
      generatedPromptRef.current = nextPrompt;
      onManualPromptChange?.(false);
      onChange(nextPrompt, nextStylePreset);
      return;
    }

    onChange(prompt, nextStylePreset);
  }

  function applyTemplateSuggestion() {
    if (!template) return;
    const productName =
      assets.find((asset) => asset.asset_type === "product_image")?.metadata.product_name ||
      "mi producto";
    const filled = template.prompt_template.replace(/{product_name}/g, String(productName));
    generatedPromptRef.current = null;
    manualPromptEditRef.current = false;
    onManualPromptChange?.(false);
    onChange(filled, stylePreset);
  }

  function buildPrompt() {
    const nextPrompt = createPrompt(activeBrief);
    generatedPromptRef.current = nextPrompt;
    manualPromptEditRef.current = false;
    onManualPromptChange?.(false);
    onChange(nextPrompt, stylePreset);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--seller-line)] bg-[var(--seller-panel)] p-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[var(--seller-accent)]">
            <Wand2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--seller-ink)]">
              Brief rapido de marketing
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--seller-muted)]">
              Responde solo lo esencial o deja que la IA decida lo que no tengas claro.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OptionGroup
          label="Objetivo"
          value={activeBrief.goal}
          options={GOAL_OPTIONS}
          onChange={(goal) => updateBrief({ goal })}
        />
        <OptionGroup
          label="Audiencia"
          value={activeBrief.audience}
          options={AUDIENCE_OPTIONS}
          onChange={(audience) => updateBrief({ audience })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BriefField
          label="Beneficio principal"
          value={activeBrief.keyBenefit}
          placeholder="Ej: tejido resistente, colores vivos, pieza unica"
          onChange={(keyBenefit) => updateBrief({ keyBenefit })}
        />
        <BriefField
          label="Gancho inicial"
          value={activeBrief.hook}
          placeholder="Ej: mostrarlo como regalo especial"
          onChange={(hook) => updateBrief({ hook })}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OptionGroup
          label="Direccion de camara"
          value={activeBrief.cameraPlan}
          options={CAMERA_OPTIONS}
          onChange={(cameraPlan) => updateBrief({ cameraPlan })}
        />
        <OptionGroup
          label="CTA"
          value={activeBrief.cta}
          options={CTA_OPTIONS}
          onChange={(cta) => updateBrief({ cta })}
        />
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
          Estilo visual
        </p>
        <div className="flex flex-wrap gap-2">
          {STYLE_PRESETS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                const nextStyle = stylePreset === s.key && s.key !== "ai_decide" ? "ai_decide" : s.key;
                updateBrief(
                  { mood: nextStyle === "ai_decide" ? AI_DECIDE_VALUE : s.label.toLowerCase() },
                  nextStyle
                );
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                stylePreset === s.key
                  ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[var(--seller-accent)]"
                  : "border-[var(--seller-line)] bg-white text-[var(--seller-text)] hover:border-[var(--seller-line-strong)]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            Prompt final
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {template && (
              <button
                type="button"
                onClick={applyTemplateSuggestion}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--seller-line)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--seller-muted)] transition hover:bg-[var(--seller-panel)]"
              >
                <Sparkles className="h-3 w-3" />
                Plantilla base
              </button>
            )}
            <button
              type="button"
              onClick={buildPrompt}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--seller-accent)] px-3 py-1.5 text-[11px] font-semibold text-white transition hover:opacity-90"
            >
              <Wand2 className="h-3 w-3" />
              Crear prompt profesional
            </button>
          </div>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => {
            generatedPromptRef.current = null;
            manualPromptEditRef.current = true;
            onManualPromptChange?.(true);
            onChange(e.target.value, stylePreset);
          }}
          placeholder="Crea el prompt profesional con el brief o ajustalo aqui."
          rows={6}
          maxLength={1000}
        className="w-full resize-none rounded-xl border border-[var(--seller-line)] bg-white px-3 py-2.5 text-sm text-[var(--seller-ink)] placeholder:text-[var(--seller-faint-text)] focus:border-[var(--seller-accent)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-[var(--seller-faint-text)]">
          <span>Camara, movimiento, beneficio y CTA en un solo prompt.</span>
          <span>{prompt.length}/1000</span>
        </div>
      </div>

      {assets.length === 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Selecciona al menos un producto o imagen de apoyo para anclar el video visualmente.
        </div>
      )}
    </div>
  );
}

function BriefField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const aiSelected = isAiDecisionValue(value);

  return (
    <div className="block">
      <span className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
          {label}
        </span>
        <button
          type="button"
          onClick={() => onChange(AI_DECIDE_VALUE)}
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
            aiSelected
              ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[var(--seller-accent)]"
              : "border-[var(--seller-line)] bg-white text-[var(--seller-muted)] hover:border-[var(--seller-line-strong)]"
          }`}
        >
          IA decide
        </button>
      </span>
      <input
        value={aiSelected ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={aiSelected ? "La IA elegira este punto segun producto, marca y plantilla." : placeholder}
        maxLength={140}
        className="w-full rounded-xl border border-[var(--seller-line)] bg-white px-3 py-2.5 text-sm text-[var(--seller-ink)] placeholder:text-[var(--seller-faint-text)] focus:border-[var(--seller-accent)] focus:outline-none focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]"
      />
    </div>
  );
}

function OptionGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {[AI_DECIDE_VALUE, ...options].map((option) => {
          const isAiOption = option === AI_DECIDE_VALUE;
          const active = isAiOption ? isAiDecisionValue(value) : value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(active && !isAiOption ? AI_DECIDE_VALUE : option)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_10%,white)] text-[var(--seller-accent)]"
                  : "border-[var(--seller-line)] bg-white text-[var(--seller-text)] hover:border-[var(--seller-line-strong)]"
              }`}
            >
              {isAiOption ? "Que la IA decida" : option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
