"use client";

import { CheckCircle2, Search } from "lucide-react";
import type { VideoTemplate, VideoObjective, VideoFormat } from "@/types/video-studio";

const OBJECTIVE_LABELS: Record<VideoObjective, string> = {
  product: "Producto",
  promo: "Promoción",
  live: "Live",
  collection: "Colección",
};

const OBJECTIVE_COLORS: Record<VideoObjective, string> = {
  product: "bg-violet-50 text-violet-700 border-violet-200",
  promo: "bg-amber-50 text-amber-700 border-amber-200",
  live: "bg-red-50 text-red-700 border-red-200",
  collection: "bg-teal-50 text-teal-700 border-teal-200",
};

const FORMAT_LABELS: Record<VideoFormat, string> = {
  "9:16": "Stories",
  "1:1": "Feed",
  "16:9": "Landscape",
};

interface Props {
  templates: VideoTemplate[];
  selectedId: string | null;
  onSelect: (template: VideoTemplate) => void;
  selectedOnly?: boolean;
  onShowAll?: () => void;
}

export default function VideoTemplatePicker({
  templates,
  selectedId,
  onSelect,
  selectedOnly = false,
  onShowAll,
}: Props) {
  const visibleTemplates =
    selectedOnly && selectedId
      ? templates.filter((template) => template.id === selectedId)
      : templates;

  if (selectedOnly && selectedId && visibleTemplates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--seller-line)] bg-[var(--seller-panel)] p-4 text-sm text-[var(--seller-muted)]">
        La plantilla actual no está disponible en el catálogo activo.
      </div>
    );
  }

  const byObjective = templates.reduce<Record<string, VideoTemplate[]>>((acc, t) => {
    if (!visibleTemplates.some((visible) => visible.id === t.id)) return acc;
    const key = t.objective;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-3.5">
      {selectedOnly && selectedId && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--seller-line)] bg-[var(--seller-panel)] px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-[var(--seller-ink)]">
              Plantilla seleccionada
            </p>
            <p className="text-[11px] text-[var(--seller-muted)]">
              Las demas opciones estan ocultas para mantener limpio el editor.
            </p>
          </div>
          <button
            type="button"
            onClick={onShowAll}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
          >
            <Search className="h-3.5 w-3.5" />
            Cambiar
          </button>
        </div>
      )}
      {(Object.keys(byObjective) as VideoObjective[]).map((objective) => (
        <div key={objective}>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            {OBJECTIVE_LABELS[objective]}
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {byObjective[objective].map((tpl) => {
              const isSelected = tpl.id === selectedId;
              return (
                <button
                  key={tpl.id}
                  onClick={() => onSelect(tpl)}
                  className={`relative flex items-start gap-3 rounded-xl border p-3 text-left transition
                    ${isSelected
                      ? "border-[var(--seller-accent)] bg-[color:color-mix(in_srgb,var(--seller-accent)_8%,white)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--seller-accent)_15%,transparent)]"
                      : "border-[var(--seller-line)] bg-white hover:border-[var(--seller-line-strong)] hover:bg-[var(--seller-panel)]"
                    }`}
                >
                  {isSelected && (
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-[var(--seller-accent)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="pr-5 text-sm font-semibold text-[var(--seller-ink)]">{tpl.name}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${OBJECTIVE_COLORS[tpl.objective]}`}>
                        {OBJECTIVE_LABELS[tpl.objective]}
                      </span>
                      <span className="rounded-full border border-[var(--seller-line)] bg-[var(--seller-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--seller-muted)]">
                        {tpl.format} · {FORMAT_LABELS[tpl.format as VideoFormat]}
                      </span>
                      <span className="rounded-full border border-[var(--seller-line)] bg-[var(--seller-panel)] px-2 py-0.5 text-[10px] font-medium text-[var(--seller-muted)]">
                        {tpl.duration_seconds}s
                      </span>
                    </div>
                    {tpl.prompt_template && (
                      <p className="mt-2 text-[11px] text-[var(--seller-faint-text)] line-clamp-2 leading-relaxed">
                        {tpl.prompt_template}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
