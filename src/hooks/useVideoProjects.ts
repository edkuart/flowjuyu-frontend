"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fetchVideoProjects } from "@/services/sellerVideoStudio";
import type { VideoProject } from "@/types/video-studio";

const ACTIVE_STATUSES = new Set(["queued", "validating", "generating", "processing_output"]);
const POLL_INTERVAL_MS = 5_000;

export function useVideoProjects() {
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchVideoProjects();
      if (!mountedRef.current) return;
      setProjects(data);
      setError(null);

      // Si hay generaciones activas, vuelve a recargar en POLL_INTERVAL_MS
      const hasActive = data.some(
        (p) => p.last_generation && ACTIVE_STATUSES.has(p.last_generation.status ?? "")
      );
      if (hasActive) {
        timerRef.current = setTimeout(load, POLL_INTERVAL_MS);
      }
    } catch {
      if (mountedRef.current) setError("No se pudieron cargar los proyectos");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [load]);

  return { projects, loading, error, refresh: load };
}
