"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Loader2,
  Package,
  Play,
} from "lucide-react";
import VideoTemplatePicker from "./VideoTemplatePicker";
import ProductAssetPicker from "./ProductAssetPicker";
import PromptAssistantPanel from "./PromptAssistantPanel";
import ProviderPicker from "./ProviderPicker";
import { StudioBadge, StudioSection } from "./StudioPrimitives";
import {
  createVideoProject,
  upsertVideoAssets,
  uploadVideoAssetImages,
} from "@/services/sellerVideoStudio";
import { formatCostGTQ } from "@/lib/videoStudioCost";
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
  VideoTemplate,
  VideoObjective,
  VideoFormat,
  SupportedProvider,
} from "@/types/video-studio";

interface SelectedProvider {
  provider: SupportedProvider;
  model: string;
}

interface Props {
  templates: VideoTemplate[];
}

type SectionKey = "template" | "products" | "brief" | "provider";

export default function VideoProjectWizard({ templates }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localAssetFilesRef = useRef<Record<string, File>>({});
  const localPreviewUrlsRef = useRef<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);
  const [selectedAssets, setSelectedAssets] = useState<SelectedVideoAsset[]>([]);
  const [prompt, setPrompt] = useState("");
  const [manualPrompt, setManualPrompt] = useState(false);
  const [stylePreset, setStylePreset] = useState("editorial");
  const [brief, setBrief] = useState<VideoCreativeBrief>(DEFAULT_VIDEO_BRIEF);
  const [sellerProfile, setSellerProfile] = useState<Partial<VendedorPerfil> | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<SelectedProvider>({
    provider: "fal",
    model: "luma-dream-machine",
  });
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const sectionRefs = {
    template: useRef<HTMLDivElement | null>(null),
    products: useRef<HTMLDivElement | null>(null),
    brief: useRef<HTMLDivElement | null>(null),
    provider: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    apiGetVendedorPerfil()
      .then((res) => {
        if (res.ok && res.perfil) setSellerProfile(res.perfil);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    return () => {
      localPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function handleUploadFiles(files: File[]) {
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const compressed = await compressImages(files);
      const nextAssets: SelectedVideoAsset[] = compressed.map((file, index) => {
        const uploadKey = `local-${Date.now()}-${index}-${file.name}`;
        const previewUrl = URL.createObjectURL(file);
        localAssetFilesRef.current[uploadKey] = file;
        localPreviewUrlsRef.current.push(previewUrl);
        return {
          product_id: null,
          source_url: previewUrl,
          asset_type: "custom_image",
          metadata: {
            file_name: file.name,
            role: "supporting_reference",
            upload_key: uploadKey,
          },
        };
      });

      setSelectedAssets((prev) => [...prev, ...nextAssets].slice(0, 6));
    } catch (e: any) {
      setError(e.message ?? "No se pudieron preparar las imagenes");
    } finally {
      setUploadingImages(false);
    }
  }

  function focusSection(section: SectionKey | null) {
    setOpenSection(section);
    if (!section) return;
    window.setTimeout(() => {
      sectionRefs[section].current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 60);
  }

  async function handleSubmit() {
    if (!selectedTemplate) return;
    setSaving(true);
    setError(null);
    try {
      const finalPrompt =
        manualPrompt && prompt.trim()
          ? prompt
          : buildProfessionalVideoPrompt({
              brief,
              assets: selectedAssets,
              sellerProfile,
              template: selectedTemplate,
              format: selectedTemplate.format as VideoFormat,
              durationSeconds: selectedTemplate.duration_seconds,
              stylePreset,
            });
      const project = await createVideoProject({
        title: title || selectedTemplate.name,
        objective: selectedTemplate.objective as VideoObjective,
        format: selectedTemplate.format as VideoFormat,
        duration_seconds: selectedTemplate.duration_seconds,
        template_id: selectedTemplate.id,
        prompt: finalPrompt,
        style_preset: stylePreset,
      });

      if (selectedAssets.length > 0) {
        const productAssets = selectedAssets.filter((a) => a.asset_type === "product_image");
        const remoteCustomAssets = selectedAssets.filter(
          (a) => a.asset_type !== "product_image" && !a.metadata.upload_key
        );
        const localCustomAssets = selectedAssets.filter((a) => a.metadata.upload_key);
        const localFiles = localCustomAssets
          .map((asset) => localAssetFilesRef.current[String(asset.metadata.upload_key)])
          .filter((file): file is File => Boolean(file));
        const uploadedAssets =
          localFiles.length > 0
            ? await uploadVideoAssetImages(localFiles)
            : [];
        const customAssets = uploadedAssets.map((asset, index) => ({
          product_id: asset.product_id,
          source_url: asset.source_url,
          asset_type: asset.asset_type,
          metadata: {
            ...asset.metadata,
            role: localCustomAssets[index]?.metadata.role ?? "supporting_reference",
            file_name: localCustomAssets[index]?.metadata.file_name ?? asset.metadata.file_name,
          },
        }));

        await upsertVideoAssets(
          project.id,
          [...productAssets, ...remoteCustomAssets, ...customAssets].map((a, i) => ({
            ...a,
            product_id: a.product_id ?? null,
            sort_order: i,
          }))
        );
      }

      // Guardar la selección de provider en sessionStorage para que el editor la use
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `vs_provider_${project.id}`,
          JSON.stringify(selectedProvider)
        );
      }

      router.push(`/seller/video-studio/${project.id}`);
    } catch (e: any) {
      setError(e.message ?? "Error al crear el proyecto");
      setSaving(false);
    }
  }

  const durationSeconds = selectedTemplate?.duration_seconds ?? 10;
  const canCreate = Boolean(selectedTemplate) && selectedAssets.length > 0 && !saving;
  const nextSection: SectionKey =
    !selectedTemplate ? "template" :
    selectedAssets.length === 0 ? "products" :
    !prompt ? "brief" :
    "provider";
  const nextLabel =
    nextSection === "template" ? "Elegir plantilla" :
    nextSection === "products" ? "Agregar visuales" :
    nextSection === "brief" ? "Crear brief" :
    "Revisar proveedor";
  const progress = [
    { label: "Plantilla", done: Boolean(selectedTemplate), active: nextSection === "template" },
    { label: "Visuales", done: selectedAssets.length > 0, active: nextSection === "products" },
    { label: "Brief", done: Boolean(prompt), active: nextSection === "brief" },
    { label: "Proveedor", done: Boolean(selectedProvider.model), active: nextSection === "provider" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-3.5">
      <div className="rounded-[18px] border border-[var(--seller-line)] bg-white px-3.5 py-3.5 shadow-[var(--seller-shadow-panel)] sm:px-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
              Nuevo proyecto de video
            </p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={selectedTemplate?.name ?? "Ej: Promo de huipil rojo"}
              maxLength={160}
              className="mt-1 w-full bg-transparent text-lg font-semibold leading-tight text-[var(--seller-ink)] placeholder:text-[var(--seller-muted)] focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <StudioBadge tone={selectedTemplate ? "accent" : "default"}>
                {selectedTemplate?.name ?? "Elige plantilla"}
              </StudioBadge>
              <StudioBadge>{selectedTemplate?.format ?? "Formato"}</StudioBadge>
              <StudioBadge>{selectedTemplate ? `${durationSeconds}s` : "Duracion"}</StudioBadge>
              <StudioBadge tone={selectedAssets.length ? "success" : "default"}>
                {selectedAssets.length} visuales
              </StudioBadge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {progress.map((step) => (
                <FlowStep key={step.label} {...step} />
              ))}
            </div>
          </div>

          <div className="shrink-0 space-y-2.5 rounded-2xl border border-[var(--seller-line)] bg-[var(--seller-panel)] p-3 text-xs lg:w-[310px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <Row label="Estilo" value={stylePreset} />
              <Row label="Objetivo" value={brief.goal} />
              <Row label="Proveedor" value={selectedProvider.model} />
              <Row
                label="Costo"
                value={formatCostGTQ(selectedProvider.provider, selectedProvider.model, durationSeconds)}
                highlight
              />
            </div>
            <button
              type="button"
              onClick={() => focusSection(nextSection)}
              className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--seller-line)] bg-white px-4 text-xs font-semibold text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)]"
            >
              {nextLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canCreate}
              className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--seller-accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {saving ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </div>
      </div>

      <StudioSection
        refObject={sectionRefs.template}
        icon={LayoutTemplate}
        title="Plantilla"
        subtitle={selectedTemplate ? `${selectedTemplate.name} · ${selectedTemplate.format} · ${durationSeconds}s` : "Elige una idea inicial para el video"}
        open={openSection === "template"}
        onToggle={() => focusSection(openSection === "template" ? null : "template")}
      >
        <VideoTemplatePicker
          templates={templates}
          selectedId={selectedTemplate?.id ?? null}
          onSelect={(template) => {
            setSelectedTemplate(template);
            focusSection("products");
          }}
        />
      </StudioSection>

      <StudioSection
        refObject={sectionRefs.products}
        icon={Package}
        title="Visuales"
        subtitle={`${selectedAssets.length} seleccionados`}
        open={openSection === "products"}
        onToggle={() => focusSection(openSection === "products" ? null : "products")}
      >
        <ProductAssetPicker
          selected={selectedAssets}
          onChange={setSelectedAssets}
          onUploadFiles={handleUploadFiles}
          uploadingImages={uploadingImages}
        />
      </StudioSection>

      <StudioSection
        refObject={sectionRefs.brief}
        icon={FileText}
        title="Brief creativo"
        subtitle={prompt ? `${prompt.length} caracteres` : "Prompt profesional pendiente"}
        open={openSection === "brief"}
        onToggle={() => focusSection(openSection === "brief" ? null : "brief")}
      >
        <PromptAssistantPanel
          prompt={prompt}
          stylePreset={stylePreset}
          template={selectedTemplate}
          assets={selectedAssets}
          sellerProfile={sellerProfile}
          brief={brief}
          format={selectedTemplate?.format as VideoFormat | undefined}
          durationSeconds={durationSeconds}
          onBriefChange={setBrief}
          onChange={(p, s) => { setPrompt(p); setStylePreset(s); }}
          onManualPromptChange={setManualPrompt}
        />
      </StudioSection>

      <StudioSection
        refObject={sectionRefs.provider}
        icon={Play}
        title="Calidad y proveedor"
        subtitle={`${selectedProvider.model} · ${selectedProvider.provider}`}
        open={openSection === "provider"}
        onToggle={() => focusSection(openSection === "provider" ? null : "provider")}
      >
        <ProviderPicker
          selected={selectedProvider}
          onChange={setSelectedProvider}
          durationSeconds={durationSeconds}
          hasImages={selectedAssets.length > 0}
        />
      </StudioSection>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

function FlowStep({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div
      className={`flex min-h-9 items-center gap-2 rounded-xl border px-2.5 text-[11px] font-semibold ${
        done
          ? "border-[color:color-mix(in_srgb,var(--seller-accent)_20%,white)] bg-[color:color-mix(in_srgb,var(--seller-accent)_7%,white)] text-[var(--seller-accent)]"
          : active
            ? "border-amber-100 bg-amber-50 text-amber-700"
            : "border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-faint-text)]"
      }`}
    >
      {done ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      <span className="truncate">{label}</span>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <span className="shrink-0 text-[var(--seller-muted)]">{label}</span>
      <span className={`min-w-0 truncate text-right font-medium ${highlight ? "text-[var(--seller-accent)]" : "text-[var(--seller-ink)]"}`}>
        {value}
      </span>
    </div>
  );
}
