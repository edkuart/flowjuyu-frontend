import { apiFetch } from "@/lib/api";
import type {
  VideoProject,
  VideoProjectDetail,
  VideoTemplate,
  VideoGeneration,
  VideoAsset,
  ProviderModelConfig,
  CreateVideoProjectPayload,
  StartGenerationPayload,
} from "@/types/video-studio";

const BASE = "/api/seller";

// ─── Provider models ─────────────────────────────────────────────────────────

export async function fetchProviderModels(): Promise<ProviderModelConfig[]> {
  const res = await apiFetch(`${BASE}/video-provider-models`);
  const data = await res.json();
  return data.providers ?? [];
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function fetchVideoTemplates(): Promise<VideoTemplate[]> {
  const res = await apiFetch(`${BASE}/video-templates`);
  const data = await res.json();
  return data.templates ?? [];
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function fetchVideoProjects(): Promise<VideoProject[]> {
  const res = await apiFetch(`${BASE}/video-projects`);
  const data = await res.json();
  return data.projects ?? [];
}

export async function createVideoProject(
  payload: CreateVideoProjectPayload
): Promise<VideoProject> {
  const res = await apiFetch(`${BASE}/video-projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al crear proyecto");
  return data.project;
}

export async function fetchVideoProject(id: string): Promise<VideoProjectDetail> {
  const res = await apiFetch(`${BASE}/video-projects/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Proyecto no encontrado");
  return { ...data.project, assets: data.assets ?? [], generations: data.generations ?? [] };
}

export async function updateVideoProject(
  id: string,
  payload: Partial<{ title: string; prompt: string; style_preset: string; status: string; template_id: string }>
): Promise<VideoProject> {
  const res = await apiFetch(`${BASE}/video-projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al actualizar proyecto");
  return data.project;
}

export async function deleteVideoProject(id: string): Promise<void> {
  await apiFetch(`${BASE}/video-projects/${id}`, { method: "DELETE" });
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export async function upsertVideoAssets(
  projectId: string,
  assets: Omit<VideoAsset, "id">[]
): Promise<VideoAsset[]> {
  const res = await apiFetch(`${BASE}/video-projects/${projectId}/assets`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assets }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al guardar assets");
  return data.assets ?? [];
}

export async function uploadVideoAssetImages(files: File[]): Promise<Omit<VideoAsset, "id">[]> {
  const form = new FormData();
  files.slice(0, 6).forEach((file) => form.append("images", file));

  const res = await apiFetch(`${BASE}/video-assets/upload`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al subir imagenes");
  return data.assets ?? [];
}

// ─── Generations ─────────────────────────────────────────────────────────────

export async function startVideoGeneration(
  projectId: string,
  payload: StartGenerationPayload
): Promise<VideoGeneration> {
  const res = await apiFetch(`${BASE}/video-projects/${projectId}/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error ?? "Error al iniciar generación") as Error & { code?: string };
    err.code = data.code;
    throw err;
  }
  return data.generation;
}

export async function pollVideoGeneration(generationId: string): Promise<VideoGeneration> {
  const res = await apiFetch(`${BASE}/video-generations/${generationId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${data.error ?? "Generación no encontrada"}`);
  return data.generation;
}

export async function cancelVideoGeneration(generationId: string): Promise<void> {
  await apiFetch(`${BASE}/video-generations/${generationId}/cancel`, { method: "POST" });
}

export async function deleteVideoGeneration(generationId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/video-generations/${generationId}`, { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Error al eliminar generación");
  }
}

export async function downloadVideoGeneration(generationId: string): Promise<Blob> {
  const res = await apiFetch(`${BASE}/video-generations/${generationId}/download`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "No se pudo descargar el video");
  }
  return res.blob();
}

// ─── Credits ─────────────────────────────────────────────────────────────────

export interface VideoCreditBalance {
  balance_gtq_cents: number;
  balance_gtq: string;
}

export async function fetchVideoCredits(): Promise<VideoCreditBalance> {
  const res = await apiFetch(`${BASE}/video-credits`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Error al obtener créditos");
  return data;
}

export async function createCreditCheckout(
  packageId: string,
  projectId: string
): Promise<{ approveUrl: string }> {
  const res = await apiFetch(`${BASE}/video-credits/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ package_id: packageId, project_id: projectId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al iniciar el pago");
  return { approveUrl: data.approve_url };
}

export async function captureCreditPayment(
  orderId: string
): Promise<{ gtqCents: number; newBalance?: number }> {
  const res = await apiFetch(`${BASE}/video-credits/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error al confirmar el pago");
  return { gtqCents: data.gtq_cents, newBalance: data.new_balance };
}
