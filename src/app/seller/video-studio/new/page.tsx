"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { fetchVideoTemplates } from "@/services/sellerVideoStudio";
import VideoProjectWizard from "@/components/seller/video-studio/VideoProjectWizard";
import type { VideoTemplate } from "@/types/video-studio";

export default function NewVideoProjectPage() {
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchVideoTemplates()
      .then(setTemplates)
      .catch(() => setError("No se pudieron cargar las plantillas"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load, attempt]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/seller/video-studio"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--seller-line)] bg-white text-[var(--seller-text)] transition hover:bg-[var(--seller-panel)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-[var(--seller-ink)]">Nuevo proyecto de video</h1>
          <p className="text-xs text-[var(--seller-muted)]">Sigue los pasos para configurar tu video</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[var(--seller-faint-text)]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-[var(--seller-muted)]">{error}</p>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--seller-line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      ) : (
        <VideoProjectWizard templates={templates} />
      )}
    </div>
  );
}
