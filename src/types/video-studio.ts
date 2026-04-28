export type VideoObjective = "product" | "promo" | "live" | "collection";
export type SupportedProvider = "mock" | "fal" | "runway";
export type VideoAssetType = "product_image" | "custom_image" | "logo" | "text_overlay";

export interface ProviderModelConfig {
  provider: SupportedProvider;
  model: string;
  label: string;
  badge?: "recommended" | "cheapest" | "premium" | "experimental";
  costCentsMin: number;
  costCentsMax: number;
  estimatedSeconds: number;
  supportsI2V: boolean;
  qualityScore: number;
}
export type VideoFormat = "9:16" | "1:1" | "16:9";
export type VideoProjectStatus = "draft" | "ready" | "archived";
export type VideoGenerationStatus =
  | "queued"
  | "validating"
  | "generating"
  | "processing_output"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export interface VideoTemplate {
  id: string;
  slug: string;
  name: string;
  objective: VideoObjective;
  format: VideoFormat;
  duration_seconds: number;
  prompt_template: string;
  style_config: Record<string, unknown>;
  thumbnail_url: string | null;
}

export interface VideoAsset {
  id: string;
  product_id: string | null;
  asset_type: VideoAssetType;
  source_url: string;
  storage_path?: string | null;
  metadata: Record<string, unknown>;
  sort_order: number;
}

export interface SelectedVideoAsset {
  product_id: string | null;
  source_url: string;
  asset_type: VideoAssetType;
  metadata: {
    product_name?: string;
    product_price?: number | string;
    product_sku?: string | null;
    file_name?: string;
    role?: "hero_product" | "supporting_reference" | "brand_logo";
    upload_key?: string;
    note?: string;
    storage_path?: string;
    [key: string]: unknown;
  };
}

export interface VideoCreativeBrief {
  goal: string;
  audience: string;
  keyBenefit: string;
  hook: string;
  cta: string;
  mood: string;
  cameraPlan: string;
  platform: string;
}

export interface VideoGeneration {
  id: string;
  project_id?: string;
  provider: string;
  model?: string;
  status: VideoGenerationStatus;
  prompt_snapshot: string | null;
  preview_url: string | null;
  output_url: string | null;
  storage_path: string | null;
  file_size_bytes: number | null;
  error_code: string | null;
  error_message: string | null;
  cost_estimated_cents: number;
  cost_actual_cents: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface VideoProject {
  id: string;
  title: string;
  objective: VideoObjective;
  status: VideoProjectStatus;
  format: VideoFormat;
  duration_seconds: number;
  template_id: string | null;
  template_name: string | null;
  template_slug: string | null;
  prompt: string | null;
  style_preset: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
  last_generation?: Partial<VideoGeneration> | null;
}

export interface VideoProjectDetail extends VideoProject {
  prompt_template?: string | null;
  template_style_config?: Record<string, unknown> | null;
  assets: VideoAsset[];
  generations: VideoGeneration[];
}

// Payload para crear proyecto
export interface CreateVideoProjectPayload {
  title: string;
  objective: VideoObjective;
  format: VideoFormat;
  duration_seconds?: number;
  template_id?: string;
  prompt?: string;
  style_preset?: string;
}

// Payload para iniciar generación
export interface StartGenerationPayload {
  provider: SupportedProvider;
  model: string;
  prompt?: string;
}
