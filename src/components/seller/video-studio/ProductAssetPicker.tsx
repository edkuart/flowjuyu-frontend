"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Images,
  Loader2,
  Package,
  Upload,
  X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { SelectedVideoAsset } from "@/types/video-studio";

interface SellerProduct {
  id: string;
  nombre: string;
  imagen_url: string | null;
  precio: number | string;
  internal_code?: string | null;
  seller_sku?: string | null;
}

interface Props {
  selected: SelectedVideoAsset[];
  onChange: (assets: SelectedVideoAsset[]) => void;
  onUploadFiles?: (files: File[]) => void | Promise<void>;
  maxAssets?: number;
  uploadingImages?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function assetKey(asset: SelectedVideoAsset): string {
  return asset.product_id || String(asset.metadata.upload_key || asset.source_url);
}

export default function ProductAssetPicker({
  selected,
  onChange,
  onUploadFiles,
  maxAssets = 6,
  uploadingImages = false,
}: Props) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    apiFetch("/api/seller/products?limit=60")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? d ?? []))
      .catch(() => setError("No se pudieron cargar los productos"))
      .finally(() => setLoading(false));
  }, []);

  const availableProducts = useMemo(
    () => products.filter((product) => product.imagen_url),
    [products],
  );
  const selectedCustomAssets = selected.filter((asset) => asset.asset_type !== "product_image");
  const remainingSlots = Math.max(0, maxAssets - selected.length);

  function toggle(product: SellerProduct) {
    const exists = selected.find((asset) => asset.product_id === product.id);
    if (exists) {
      onChange(selected.filter((asset) => asset.product_id !== product.id));
      return;
    }

    if (selected.length >= maxAssets || !product.imagen_url) return;

    onChange([
      ...selected,
      {
        product_id: product.id,
        source_url: product.imagen_url,
        asset_type: "product_image",
        metadata: {
          product_name: product.nombre,
          product_price: product.precio,
          product_sku: product.seller_sku || product.internal_code || null,
          role: selected.length === 0 ? "hero_product" : "supporting_reference",
        },
      },
    ]);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!picked.length || !onUploadFiles) return;

    const invalid = picked.find((file) => !ACCEPTED_IMAGE_TYPES.includes(file.type));
    if (invalid) {
      setUploadError("Solo puedes subir imagenes JPG, PNG, WEBP o GIF.");
      return;
    }

    if (remainingSlots <= 0) {
      setUploadError(`Ya tienes ${maxAssets} visuales seleccionados.`);
      return;
    }

    setUploadError(null);
    await onUploadFiles(picked.slice(0, remainingSlots));
  }

  function removeAsset(asset: SelectedVideoAsset) {
    const key = assetKey(asset);
    onChange(selected.filter((item) => assetKey(item) !== key));
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 text-[var(--seller-faint-text)]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-[1fr_190px]">
        <div className="rounded-xl border border-[var(--seller-line)] bg-[var(--seller-panel)] px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Images className="h-4 w-4 text-[var(--seller-accent)]" />
            <p className="text-sm font-semibold text-[var(--seller-ink)]">
              Visuales del video
            </p>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--seller-muted)]">
            Combina productos con fotos de ambiente, empaque, logo o referencias de estilo.
          </p>
          <p className="mt-1.5 text-[11px] font-semibold text-[var(--seller-ink)]">
            {selected.length}/{maxAssets} seleccionados
          </p>
        </div>

        <label
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-3 py-3 text-center transition ${
            remainingSlots > 0 && onUploadFiles
              ? "border-[color:color-mix(in_srgb,var(--seller-accent)_28%,transparent)] bg-white text-[var(--seller-accent)] hover:bg-[color:color-mix(in_srgb,var(--seller-accent)_6%,white)]"
              : "border-[var(--seller-line)] bg-[var(--seller-panel)] text-[var(--seller-faint-text)]"
          }`}
        >
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="hidden"
            disabled={remainingSlots <= 0 || uploadingImages || !onUploadFiles}
            onChange={handleFileChange}
          />
          {uploadingImages ? (
            <Loader2 className="mb-2 h-5 w-5 animate-spin" />
          ) : (
            <Upload className="mb-2 h-5 w-5" />
          )}
          <span className="text-xs font-semibold">
            {uploadingImages ? "Subiendo..." : "Subir imagenes"}
          </span>
          <span className="mt-0.5 text-[10px] text-[var(--seller-faint-text)]">
            hasta {remainingSlots} mas
          </span>
        </label>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {selectedCustomAssets.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
            Imagenes de apoyo
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {selectedCustomAssets.map((asset) => (
              <div
                key={assetKey(asset)}
                className="group relative overflow-hidden rounded-xl border border-[var(--seller-line)] bg-white"
              >
                <div className="aspect-square bg-[var(--seller-panel)]">
                  <img
                    src={asset.source_url}
                    alt={asset.metadata.file_name || "Imagen de apoyo"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeAsset(asset)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[var(--seller-ink)] shadow-sm transition hover:bg-red-50 hover:text-red-600"
                  aria-label="Quitar imagen"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="p-2">
                  <p className="truncate text-[11px] font-medium text-[var(--seller-ink)]">
                    {asset.metadata.file_name || "Referencia visual"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--seller-faint-text)]">
          Productos
        </p>

        {availableProducts.length === 0 && (
          <div className="rounded-xl border border-[var(--seller-line)] bg-[var(--seller-panel)] p-5 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-[var(--seller-faint-text)]" />
            <p className="text-sm text-[var(--seller-muted)]">
              No hay productos con imagen disponibles.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availableProducts.map((product) => {
            const isSelected = selected.some((asset) => asset.product_id === product.id);
            const isDisabled = !isSelected && selected.length >= maxAssets;
            const price = Number(product.precio);

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => !isDisabled && toggle(product)}
                disabled={isDisabled}
                className={`relative flex flex-col overflow-hidden rounded-xl border text-left transition ${
                  isSelected
                    ? "border-[var(--seller-accent)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--seller-accent)_25%,transparent)]"
                    : isDisabled
                      ? "cursor-not-allowed border-[var(--seller-line)] opacity-40"
                      : "border-[var(--seller-line)] hover:border-[var(--seller-line-strong)]"
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-[var(--seller-panel)]">
                  <img
                    src={product.imagen_url!}
                    alt={product.nombre}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--seller-accent)]/20">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--seller-accent)]">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-[var(--seller-ink)]">
                    {product.nombre}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--seller-muted)]">
                    {Number.isFinite(price) ? `Q${price.toLocaleString("es-GT")}` : "Sin precio"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
