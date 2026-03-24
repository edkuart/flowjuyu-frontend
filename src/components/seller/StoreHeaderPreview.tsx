/**
 * src/components/seller/StoreHeaderPreview.tsx
 *
 * Compact live preview of the seller's public store header.
 * Used in the profile editor — updates instantly on any prop change.
 *
 * Intentionally lightweight: no Next.js Image (blob URLs need plain <img>),
 * no client-only guards, no state. Pure derived render from props.
 */

import { buildHeaderStyle } from "@/lib/headerStyle";
import type { HeaderStyle } from "@/lib/headerStyle";

type Props = {
  headerStyle: HeaderStyle;
  /** Resolved banner URL — pass `bannerPreview || formData.banner_url` */
  bannerUrl?: string | null;
  sellerName?: string | null;
  logoUrl?: string | null;
};

export function StoreHeaderPreview({
  headerStyle,
  bannerUrl,
  sellerName,
  logoUrl,
}: Props) {
  const bgStyle = buildHeaderStyle(headerStyle, bannerUrl);

  return (
    <div
      className="relative overflow-hidden rounded-xl ring-1 ring-black/[0.08] shadow-sm"
      style={{ height: 140 }}
      aria-label="Vista previa del encabezado"
    >
      {/* Background — transitions smoothly on any change */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-in-out"
        style={bgStyle}
      />

      {/* Overlay label */}
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
          Vista previa
        </span>
      </div>

      {/* Content — mirrors the public store hero layout */}
      <div className="relative h-full flex items-end p-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-contain bg-white border-2 border-white/70 shadow-md shrink-0 p-1"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/20 border-2 border-white/30 shrink-0 flex items-center justify-center">
              <span className="text-white/50 text-xs font-bold">
                {(sellerName ?? "T").charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight truncate max-w-[180px]">
              {sellerName || "Tu tienda"}
            </p>
            <p className="text-[10px] text-white/55 mt-0.5">Tienda en Flowjuyu</p>
          </div>
        </div>
      </div>
    </div>
  );
}
