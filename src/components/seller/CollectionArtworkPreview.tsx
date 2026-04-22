"use client";

import type { CSSProperties } from "react";
import { ImageIcon } from "lucide-react";

type CanvasItem = {
  id?: number | null;
  element_type?: "product" | "text" | "shape" | "image";
  content?: Record<string, unknown> | null;
  product_id?: string | null;
  pos_x?: number;
  pos_y?: number;
  width?: number;
  height?: number;
  z_index?: number;
  product_name?: string | null;
  product_image?: string | null;
};

type CollectionArtworkPreviewProps = {
  name: string;
  imageUrl?: string | null;
  items?: CanvasItem[] | null;
  backgroundColor?: string | null;
  backgroundStyle?: string | null;
  canvasWidth?: number | null;
  canvasHeight?: number | null;
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function buildTextStyle(content: Record<string, unknown> | null | undefined): CSSProperties {
  return {
    color: typeof content?.color === "string" ? content.color : "#2f2a25",
    fontSize: Math.max(7, Number(content?.fontSize ?? 20) * 0.18),
    fontWeight: content?.fontWeight === "normal" ? 400 : 700,
    fontStyle: content?.fontStyle === "italic" ? "italic" : "normal",
    textAlign:
      content?.textAlign === "left" ||
      content?.textAlign === "right" ||
      content?.textAlign === "center"
        ? content.textAlign
        : "left",
    lineHeight: Number(content?.lineHeight ?? 1.1),
    letterSpacing: Number(content?.letterSpacing ?? 0) * 0.12,
    whiteSpace: "pre-wrap",
    fontFamily: typeof content?.fontFamily === "string" ? content.fontFamily : "inherit",
  };
}

function buildShapeStyle(content: Record<string, unknown> | null | undefined): CSSProperties {
  const isCircle = content?.shapeType === "circle";
  const isLine = content?.shapeType === "line";
  return {
    background: typeof content?.fillColor === "string" ? content.fillColor : "#d8cec0",
    opacity: Number(content?.opacity ?? 1),
    borderRadius: isCircle ? "999px" : `${Number(content?.borderRadius ?? 16)}px`,
    ...(isLine ? { minHeight: 3, borderRadius: 999 } : {}),
  };
}

export default function CollectionArtworkPreview({
  name,
  imageUrl,
  items,
  backgroundColor,
  backgroundStyle,
  canvasWidth,
  canvasHeight,
  className = "",
  emptyTitle = "Aún no hay imagen promocional",
  emptyDescription = "Puedes subir una portada ya editada o diseñarla en canvas si quieres una imagen nueva.",
}: CollectionArtworkPreviewProps) {
  const width = Math.max(1, Number(canvasWidth ?? 1080));
  const height = Math.max(1, Number(canvasHeight ?? 1080));
  const safeItems = Array.isArray(items) ? items : [];
  const hasCanvasArtwork = safeItems.length > 0;
  const background = backgroundStyle || backgroundColor || "linear-gradient(135deg,#FFF8F0_0%,#F5EEE5_42%,#E9DFD2_100%)";

  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`h-full w-full object-cover ${className}`.trim()} />;
  }

  if (hasCanvasArtwork) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`.trim()} style={{ background }}>
        {safeItems.slice().sort((a, b) => Number(a.z_index ?? 0) - Number(b.z_index ?? 0)).map((item, index) => {
          const left = `${(Number(item.pos_x ?? 0) / width) * 100}%`;
          const top = `${(Number(item.pos_y ?? 0) / height) * 100}%`;
          const itemWidth = `${Math.max(2, (Number(item.width ?? 40) / width) * 100)}%`;
          const itemHeight = `${Math.max(2, (Number(item.height ?? 20) / height) * 100)}%`;
          const commonStyle: CSSProperties = {
            position: "absolute",
            left,
            top,
            width: itemWidth,
            height: itemHeight,
            overflow: "hidden",
          };
          const content = (item.content ?? null) as Record<string, unknown> | null;
          const key = `${item.id ?? "canvas"}-${item.element_type}-${index}`;

          if (item.element_type === "text") {
            return (
              <div key={key} style={{ ...commonStyle, ...buildTextStyle(content) }}>
                {typeof content?.text === "string" ? content.text : "Texto"}
              </div>
            );
          }

          if (item.element_type === "shape") {
            return <div key={key} style={{ ...commonStyle, ...buildShapeStyle(content) }} />;
          }

          if (item.element_type === "image") {
            const imageSrc = typeof content?.url === "string" ? content.url : null;
            if (!imageSrc) return null;
            return <img key={key} src={imageSrc} alt="" style={commonStyle} className="object-cover" />;
          }

          if (item.element_type === "product") {
            if (item.product_image) {
              return <img key={key} src={item.product_image} alt={item.product_name ?? ""} style={commonStyle} className="rounded-md object-cover" />;
            }
            return <div key={key} style={{ ...commonStyle, background: "#dbe4ea", borderRadius: 10 }} />;
          }

          return null;
        })}
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#F7E8D7_0%,#EAD3BB_48%,#E4D9CC_100%)] px-6 text-center text-neutral-500 ${className}`.trim()}>
      <ImageIcon className="h-8 w-8 opacity-60" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-neutral-700">{emptyTitle}</p>
        <p className="text-xs text-neutral-500">{emptyDescription}</p>
      </div>
    </div>
  );
}
