"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Play,
  Save,
  Trash2,
  Film,
  Package,
  FileText,
  LayoutTemplate,
  AlertCircle,
  X,
  Zap,
} from "lucide-react";
import {
  fetchVideoProject,
  fetchVideoTemplates,
  updateVideoProject,
  deleteVideoProject,
  upsertVideoAssets,
  uploadVideoAssetImages,
  startVideoGeneration,
} from "@/services/sellerVideoStudio";
import AiCreditTopUpModal from "@/components/seller/ai/AiCreditTopUpModal";
import GenerationStatusCard from "@/components/seller/video-studio/GenerationStatusCard";
import ProductAssetPicker from "@/components/seller/video-studio/ProductAssetPicker";
import PromptAssistantPanel from "@/components/seller/video-studio/PromptAssistantPanel";
import ProviderPicker from "@/components/seller/video-studio/ProviderPicker";
import VideoTemplatePicker from "@/components/seller/video-studio/VideoTemplatePicker";
import {
  StudioBadge,
  StudioSection,
} from "@/components/seller/video-studio/StudioPrimitives";
import { compressImages } from "@/lib/imageCompression";
import {
  DEFAULT_VIDEO_BRIEF,
  buildProfessionalVideoPrompt,
} from "@/lib/videoPromptBuilder";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import type { VendedorPerfil } from "@/types/db";
import type {
  SelectedVideoAsset,
  VideoCreativeBrief,
  VideoProjectDetail,
  VideoGeneration,
  VideoTemplate,
  SupportedProvider,
} from "@/types/video-studio";

function videoAiCreditCost(provider: SupportedProvider, model: string): number {
  if (provider === "mock") return 0;
  if (provider === "runway" || model.toLowerCase().includes("runway"))
    return 31;
  if (model.toLowerCase().includes("kling")) return 7;
  return 14;
}

export default function VideoProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<VideoProjectDetail | null>(null);
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Editable fields
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("editorial");
  const [selectedTemplate, setSelectedTemplate] =
    useState<VideoTemplate | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<SelectedVideoAsset[]>(
    [],
  );
  const [brief, setBrief] = useState<VideoCreativeBrief>(DEFAULT_VIDEO_BRIEF);
  const [manualPrompt, setManualPrompt] = useState(false);
  const [sellerProfile, setSellerProfile] =
    useState<Partial<VendedorPerfil> | null>(null);

  // Provider selection — default fal/luma; mock visible en dev para pruebas sin costo
  const [selectedProvider, setSelectedProvider] = useState<{
    provider: SupportedProvider;
    model: string;
  }>({
    provider: "fal",
    model: "luma-dream-machine",
  });

  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditSuccess, setCreditSuccess] = useState(false);

  // Sections
  const [showGenerations, setShowGenerations] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showProvider, setShowProvider] = useState(false);

  useEffect(() => {
    fetchVideoTemplates()
      .then(setTemplates)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!project || templates.length === 0) return;
    const current = templates.find((tpl) => tpl.id === project.template_id);
    if (current) {
      setSelectedTemplate(current);
      return;
    }

    if (project.template_id) {
      setSelectedTemplate({
        id: project.template_id,
        slug: project.template_slug ?? "",
        name: project.template_name ?? "Plantilla actual",
        objective: project.objective,
        format: project.format,
        duration_seconds: project.duration_seconds,
        prompt_template: project.prompt_template ?? "",
        style_config: project.template_style_config ?? {},
        thumbnail_url: project.thumbnail_url ?? null,
      });
    } else {
      setSelectedTemplate(null);
    }
  }, [project, templates]);

  const load = useCallback(async () => {
    try {
      const data = await fetchVideoProject(id);
      setProject(data);
      setShowTemplates(false);
      setTitle(data.title);
      setPrompt(data.prompt ?? "");
      setManualPrompt(Boolean(data.prompt));
      setStylePreset(data.style_preset ?? "editorial");
      setSelectedAssets(
        data.assets.map((a) => ({
          product_id: a.product_id ?? null,
          source_url: a.source_url,
          asset_type: a.asset_type,
          metadata: {
            product_name: (a.metadata as any).product_name ?? "",
            product_price: (a.metadata as any).product_price ?? 0,
            product_sku: (a.metadata as any).product_sku ?? null,
            file_name: (a.metadata as any).file_name ?? "",
            role: (a.metadata as any).role ?? "supporting_reference",
            storage_path:
              (a.metadata as any).storage_path ?? a.storage_path ?? undefined,
          },
        })),
      );
      if (typeof window !== "undefined") {
        const storedProvider = sessionStorage.getItem(`vs_provider_${id}`);
        if (storedProvider) {
          try {
            const parsed = JSON.parse(storedProvider) as {
              provider?: SupportedProvider;
              model?: string;
            };
            if (parsed.provider && parsed.model) {
              setSelectedProvider({
                provider: parsed.provider,
                model: parsed.model,
              });
            }
          } catch {
            sessionStorage.removeItem(`vs_provider_${id}`);
          }
        }
      }
    } catch {
      setError("No se pudo cargar el proyecto");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    apiGetVendedorPerfil()
      .then((res) => {
        if (res.ok && res.perfil) setSellerProfile(res.perfil);
      })
      .catch(() => {});
  }, []);

  // Handle central payment return: /seller/payments/return -> this project
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("credit_success") === "1") {
      setCreditSuccess(true);
      setInsufficientCredits(false);
      router.replace(`/seller/video-studio/${id}`, { scroll: false } as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function persistProjectState(): Promise<string> {
    const shouldUseManualPrompt = manualPrompt && prompt.trim();
    const finalPrompt = shouldUseManualPrompt
      ? prompt
      : buildProfessionalVideoPrompt({
          brief,
          assets: selectedAssets,
          sellerProfile,
          template: selectedTemplate ?? templateForPrompt,
          format: selectedTemplate?.format ?? project?.format,
          durationSeconds:
            selectedTemplate?.duration_seconds ?? project?.duration_seconds,
          stylePreset,
        });

    if (!shouldUseManualPrompt) setPrompt(finalPrompt);

    await updateVideoProject(id, {
      title,
      prompt: finalPrompt,
      style_preset: stylePreset,
      template_id: selectedTemplate?.id ?? project?.template_id ?? undefined,
    });
    if (selectedAssets.length > 0) {
      await upsertVideoAssets(
        id,
        selectedAssets.map((a, i) => ({
          ...a,
          product_id: a.product_id ?? null,
          sort_order: i,
        })),
      );
    }
    return finalPrompt;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await persistProjectState();
    } catch (e: any) {
      setError(e.message ?? "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadAssetFiles(files: File[]) {
    if (!files.length) return;
    setUploadingImages(true);
    setError(null);
    try {
      const compressed = await compressImages(files);
      const uploaded = await uploadVideoAssetImages(compressed);
      const mapped: SelectedVideoAsset[] = uploaded.map((asset) => ({
        product_id: asset.product_id ?? null,
        source_url: asset.source_url,
        asset_type: asset.asset_type,
        metadata: {
          ...(asset.metadata as Record<string, unknown>),
          role: (asset.metadata as any).role ?? "supporting_reference",
        },
      }));
      setSelectedAssets((prev) => [...prev, ...mapped].slice(0, 6));
    } catch (e: any) {
      setError(e.message ?? "No se pudieron subir las imagenes");
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setInsufficientCredits(false);
    try {
      const finalPrompt = await persistProjectState();
      const gen = await startVideoGeneration(id, {
        provider: selectedProvider.provider,
        model: selectedProvider.model,
        prompt: finalPrompt || undefined,
      });
      setProject((prev) =>
        prev ? { ...prev, generations: [gen, ...prev.generations] } : prev,
      );
      setShowGenerations(true);
    } catch (e: any) {
      if ((e as any).code === "INSUFFICIENT_CREDITS") {
        setInsufficientCredits(true);
        setShowCreditModal(true);
      } else {
        setError(e.message ?? "Error al iniciar generación");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete() {
    await deleteVideoProject(id);
    router.push("/seller/video-studio");
  }

  function handleGenerationComplete(updated: VideoGeneration) {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            generations: prev.generations.map((g) =>
              g.id === updated.id ? updated : g,
            ),
          }
        : prev,
    );
  }

  function handleGenerationDeleted(generationId: string) {
    setProject((prev) =>
      prev
        ? {
            ...prev,
            generations: prev.generations.filter((g) => g.id !== generationId),
          }
        : prev,
    );
  }

  const activeGeneration = project?.generations.find((g) =>
    ["queued", "validating", "generating", "processing_output"].includes(
      g.status,
    ),
  );
  const generationCount = project?.generations.length ?? 0;
  const completedCount =
    project?.generations.filter((g) => g.status === "completed").length ?? 0;
  const selectedVideoCost = videoAiCreditCost(
    selectedProvider.provider,
    selectedProvider.model,
  );
  const templateForPrompt = project
    ? ({
        id: selectedTemplate?.id ?? project.template_id ?? "",
        slug: selectedTemplate?.slug ?? project.template_slug ?? "",
        name: selectedTemplate?.name ?? project.template_name ?? "",
        objective: selectedTemplate?.objective ?? project.objective,
        format: selectedTemplate?.format ?? project.format,
        duration_seconds:
          selectedTemplate?.duration_seconds ?? project.duration_seconds,
        prompt_template:
          selectedTemplate?.prompt_template ?? project.prompt_template ?? "",
        style_config:
          selectedTemplate?.style_config ?? project.template_style_config ?? {},
        thumbnail_url:
          selectedTemplate?.thumbnail_url ?? project.thumbnail_url ?? null,
      } as unknown as VideoTemplate)
    : null;

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-[var(--seller-faint-text)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );

  if (error && !project)
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-[var(--seller-line)] bg-white px-3 py-3 shadow-[var(--seller-shadow-panel)] sm:px-4">
        <div className="flex items-start gap-3">
          <Link
            href="/seller/video-studio"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-text)] transition hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={160}
                  className="w-full min-w-0 truncate bg-transparent text-base leading-tight font-semibold text-[var(--seller-ink)] focus:outline-none sm:text-lg"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <StudioBadge tone="accent">
                    {selectedTemplate?.name ??
                      project?.template_name ??
                      "Plantilla"}
                  </StudioBadge>
                  <StudioBadge>
                    {selectedTemplate?.format ?? project?.format}
                  </StudioBadge>
                  <StudioBadge>
                    {selectedTemplate?.duration_seconds ??
                      project?.duration_seconds}
                    s
                  </StudioBadge>
                  <StudioBadge
                    tone={selectedAssets.length ? "success" : "default"}
                  >
                    {selectedAssets.length} visuales
                  </StudioBadge>
                  <StudioBadge
                    tone={
                      completedCount
                        ? "success"
                        : activeGeneration
                          ? "warning"
                          : "default"
                    }
                  >
                    {completedCount
                      ? `${completedCount} listo${completedCount === 1 ? "" : "s"}`
                      : `${generationCount} videos`}
                  </StudioBadge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:flex md:shrink-0 md:items-center">
                <button
                  type="button"
                  onClick={() => setShowGenerations(true)}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-[var(--seller-panel)] px-3 text-xs font-semibold text-[var(--seller-ink)] transition hover:bg-white"
                >
                  <Film className="h-3.5 w-3.5" />
                  Videos
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--seller-line)] bg-white px-3 text-xs font-semibold text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Guardar
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating || !!activeGeneration}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--seller-accent)] px-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:px-4"
                >
                  {generating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  <span className="truncate">
                    {activeGeneration
                      ? "Generando"
                      : `Generar${selectedVideoCost ? ` (${selectedVideoCost} cr.)` : ""}`}
                  </span>
                </button>
              </div>
              {!activeGeneration && selectedVideoCost > 0 && (
                <p className="mt-2 text-[11px] font-medium text-[var(--seller-muted)] md:text-right">
                  Esta generación consumirá {selectedVideoCost} créditos IA.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {insufficientCredits && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-amber-900">
                Créditos de video insuficientes
              </p>
              <p className="text-xs text-amber-700">
                Este video cuesta {selectedVideoCost} créditos IA. Recarga para
                continuar sin salir del proyecto.
              </p>
            </div>
            <button
              onClick={() => setShowCreditModal(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
            >
              <Zap className="h-3.5 w-3.5" /> Comprar créditos
            </button>
          </div>
        </div>
      )}

      {creditSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-900">
                ¡Créditos añadidos exitosamente!
              </p>
              <p className="mt-0.5 text-xs text-emerald-700">
                Ya puedes generar videos.
              </p>
            </div>
            <button
              onClick={() => setCreditSuccess(false)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <AiCreditTopUpModal
        open={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        returnTo={`/seller/video-studio/${id}?credit_success=1`}
        source="video_studio"
        title="Comprar créditos para Video Studio"
        description="Compra créditos IA y vuelve a este proyecto automáticamente."
      />

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-3">
        <StudioSection
          icon={Film}
          title="Generaciones"
          subtitle={
            project?.generations?.length
              ? `${project.generations.length} video${project.generations.length === 1 ? "" : "s"} generado${project.generations.length === 1 ? "" : "s"}`
              : "Aun no hay videos generados"
          }
          open={showGenerations}
          onToggle={() => setShowGenerations((v) => !v)}
        >
          {project?.generations && project.generations.length > 0 ? (
            <div className="space-y-3">
              {project.generations.map((g) => (
                <GenerationStatusCard
                  key={g.id}
                  generation={g}
                  onComplete={handleGenerationComplete}
                  onDelete={handleGenerationDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--seller-panel)] text-[var(--seller-faint-text)]">
                <Film className="h-4 w-4" />
              </div>
              <p className="text-xs text-[var(--seller-muted)]">
                Aún no hay generaciones. Presiona "Generar" para empezar.
              </p>
            </div>
          )}
        </StudioSection>

        <StudioSection
          icon={LayoutTemplate}
          title="Plantilla"
          subtitle={
            selectedTemplate
              ? `${selectedTemplate.name} · ${selectedTemplate.format} · ${selectedTemplate.duration_seconds}s`
              : "Elige una idea inicial para el video"
          }
          open={showTemplates}
          onToggle={() => setShowTemplates((v) => !v)}
        >
          {templates.length > 0 ? (
            <VideoTemplatePicker
              templates={templates}
              selectedId={selectedTemplate?.id ?? project?.template_id ?? null}
              selectedOnly={
                !showAllTemplates &&
                Boolean(selectedTemplate ?? project?.template_id)
              }
              onShowAll={() => setShowAllTemplates(true)}
              onSelect={(template) => {
                setSelectedTemplate(template);
                setShowAllTemplates(false);
                setProject((prev) =>
                  prev
                    ? {
                        ...prev,
                        template_id: template.id,
                        template_name: template.name,
                        template_slug: template.slug,
                        prompt_template: template.prompt_template,
                        template_style_config: template.style_config,
                        objective: template.objective,
                        format: template.format,
                        duration_seconds: template.duration_seconds,
                      }
                    : prev,
                );
              }}
            />
          ) : (
            <div className="flex items-center justify-center py-8 text-[var(--seller-faint-text)]">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
        </StudioSection>

        {/* Products section */}
        <StudioSection
          icon={Package}
          title="Productos"
          subtitle={`${selectedAssets.length} seleccionados`}
          open={showProducts}
          onToggle={() => setShowProducts((v) => !v)}
        >
          <ProductAssetPicker
            selected={selectedAssets}
            onChange={setSelectedAssets}
            onUploadFiles={handleUploadAssetFiles}
            uploadingImages={uploadingImages}
          />
        </StudioSection>

        {/* Prompt section */}
        <StudioSection
          icon={FileText}
          title="Descripción del video"
          subtitle={prompt ? `${prompt.length} caracteres` : "Sin descripción"}
          open={showPrompt}
          onToggle={() => setShowPrompt((v) => !v)}
        >
          <PromptAssistantPanel
            prompt={prompt}
            stylePreset={stylePreset}
            template={templateForPrompt}
            assets={selectedAssets}
            sellerProfile={sellerProfile}
            brief={brief}
            format={project?.format}
            durationSeconds={project?.duration_seconds}
            onBriefChange={setBrief}
            onChange={(p, s) => {
              setPrompt(p);
              setStylePreset(s);
            }}
            onManualPromptChange={setManualPrompt}
          />
        </StudioSection>

        {/* Provider section */}
        <StudioSection
          icon={Play}
          title="Calidad y proveedor"
          subtitle={`${selectedProvider.model} · ${selectedProvider.provider}`}
          open={showProvider}
          onToggle={() => setShowProvider((v) => !v)}
        >
          <ProviderPicker
            selected={selectedProvider}
            onChange={setSelectedProvider}
            durationSeconds={project?.duration_seconds ?? 10}
            hasImages={selectedAssets.length > 0}
          />
        </StudioSection>

        {/* Danger zone */}
        <div className="rounded-[18px] border border-[var(--seller-line)] bg-white p-3">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm text-[var(--seller-muted)] transition hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar proyecto
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--seller-ink)]">
                ¿Eliminar este proyecto?
              </p>
              <p className="text-xs text-[var(--seller-muted)]">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-[var(--seller-line)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--seller-ink)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
