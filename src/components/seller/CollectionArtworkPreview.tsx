"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  backgroundImageUrl?: string | null;
  canvasWidth?: number | null;
  canvasHeight?: number | null;
  className?: string;
  imageFit?: "cover" | "contain";
  emptyTitle?: string;
  emptyDescription?: string;
  /** Actual rendered pixel width — used to scale canvas elements proportionally. */
  renderedWidth?: number | null;
};

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;700&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;600;700&family=Oswald:wght@400;600;700&family=Pacifico&family=Dancing+Script:wght@400;700&family=Nunito:wght@400;600;700&family=Bebas+Neue&family=Satisfy&family=Abril+Fatface&family=Josefin+Sans:ital,wght@0,400;0,700&display=swap";

const FALLBACK_BACKGROUND = "linear-gradient(135deg, #FFF8F0 0%, #F5EEE5 42%, #E9DFD2 100%)";

function buildTransform(rotation: number, flipX: boolean, flipY: boolean): string | undefined {
  const parts: string[] = [];
  if (rotation) parts.push(`rotate(${rotation}deg)`);
  if (flipX) parts.push("scaleX(-1)");
  if (flipY) parts.push("scaleY(-1)");
  return parts.length ? parts.join(" ") : undefined;
}

function buildBoxShadow(
  content: Record<string, unknown> | null | undefined,
  scale: number,
): string | undefined {
  const shadowEnabled = Boolean(content?.shadowEnabled) || Boolean(content?.shadow);
  if (!shadowEnabled) return undefined;
  const shadowX = Number(content?.shadowX ?? 4) * scale;
  const shadowY = Number(content?.shadowY ?? 4) * scale;
  const shadowBlur = Number(content?.shadowBlur ?? 8) * scale;
  const shadowSpread = Number(content?.shadowSpread ?? 0) * scale;
  const shadowColor = typeof content?.shadowColor === "string" ? content.shadowColor : "rgba(0,0,0,0.3)";
  return `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;
}

function hexToRgba(hex: string, opacity: number): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return hex;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

function getShapeClipPath(shapeType: unknown): string | undefined {
  if (shapeType === "triangle") return "polygon(50% 0%, 0% 100%, 100% 100%)";
  if (shapeType === "star") return "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
  if (shapeType === "sparkle") return "polygon(50% 0%, 59% 34%, 84% 16%, 66% 41%, 100% 50%, 66% 59%, 84% 84%, 59% 66%, 50% 100%, 41% 66%, 16% 84%, 34% 59%, 0% 50%, 34% 41%, 16% 16%, 41% 34%)";
  if (shapeType === "wave") return "polygon(0% 46%, 8% 39%, 16% 37%, 25% 41%, 33% 49%, 42% 58%, 50% 61%, 58% 57%, 67% 47%, 75% 38%, 84% 35%, 92% 39%, 100% 46%, 100% 100%, 0% 100%)";
  if (shapeType === "diamond") return "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
  return undefined;
}

function getShapeBorderRadius(content: Record<string, unknown> | null | undefined, scale: number): string {
  const shapeType = content?.shapeType;
  if (shapeType === "circle") return "50%";
  if (shapeType === "capsule") return "999px";
  if (shapeType === "arch") return "999px 999px 18px 18px";
  if (shapeType === "blob") return "58% 42% 57% 43% / 39% 44% 56% 61%";
  if (shapeType === "triangle" || shapeType === "star" || shapeType === "line" || shapeType === "sparkle" || shapeType === "wave" || shapeType === "diamond") return "0";
  return `${Math.max(0, Number(content?.borderRadius ?? 8) * scale)}px`;
}

function isBorderFriendlyShape(shapeType: unknown): boolean {
  return shapeType === "rectangle" || shapeType === "circle" || shapeType === "line" || shapeType === "capsule" || shapeType === "arch" || shapeType === "blob";
}

function getShapeBackground(content: Record<string, unknown> | null | undefined): string {
  const color1 = typeof content?.fillColor === "string" ? content.fillColor : "#d8cec0";
  const color2 = typeof content?.gradientColor2 === "string" ? content.gradientColor2 : null;
  const gradientType = content?.gradientType === "radial" ? "radial-gradient(circle, " : "linear-gradient(";
  const gradientAngle = Number(content?.gradientAngle ?? 135);
  if (content?.gradientEnabled && color2) {
    return content?.gradientType === "radial"
      ? `${gradientType}${color1} 0%, ${color2} 100%)`
      : `${gradientType}${gradientAngle}deg, ${color1} 0%, ${color2} 100%)`;
  }
  return color1;
}

// scale = renderedWidth / canvasWidth  (e.g. 300px preview of a 1080px canvas → 0.278)
function buildTextStyle(content: Record<string, unknown> | null | undefined, scale: number): CSSProperties {
  const rawFontWeight = content?.fontWeight;
  const fontWeight =
    typeof rawFontWeight === "number"
      ? rawFontWeight
      : rawFontWeight === "normal"
        ? 400
        : rawFontWeight === "bold"
          ? 700
          : rawFontWeight === "500" || rawFontWeight === "600" || rawFontWeight === "700"
            ? Number(rawFontWeight)
            : 700;
  const hasBackground = typeof content?.bgColor === "string" && content.bgColor.length > 0;
  const textAlign =
    content?.textAlign === "left" ||
    content?.textAlign === "right" ||
    content?.textAlign === "center"
      ? content.textAlign
      : "left";
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: textAlign === "right" ? "flex-end" : textAlign === "center" ? "center" : "flex-start",
    color: typeof content?.color === "string" ? content.color : "#2f2a25",
    fontSize: Math.max(6, Number(content?.fontSize ?? 20) * scale),
    fontWeight,
    fontStyle: content?.fontStyle === "italic" ? "italic" : "normal",
    textAlign,
    lineHeight: Number(content?.lineHeight ?? 1.1),
    letterSpacing: `${Number(content?.letterSpacing ?? 0) * scale}px`,
    padding: `${Math.max(1, Number(content?.paddingY ?? 8) * scale)}px ${Math.max(1, Number(content?.paddingX ?? 10) * scale)}px`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: typeof content?.fontFamily === "string" ? content.fontFamily : "inherit",
    textShadow: content?.shadow
      ? `${Number(content?.shadowX ?? 2) * scale}px ${Number(content?.shadowY ?? 2) * scale}px ${Math.max(0.5, Number(content?.shadowBlur ?? 4) * scale)}px ${typeof content?.shadowColor === "string" ? content.shadowColor : "#000000"}`
      : undefined,
    WebkitTextStroke: content?.outline
      ? `${Math.max(0.3, Number(content?.outlineWidth ?? 1) * scale)}px ${typeof content?.outlineColor === "string" ? content.outlineColor : "#000000"}`
      : undefined,
    background: hasBackground ? hexToRgba(String(content.bgColor), Number(content?.bgOpacity ?? 0.6)) : undefined,
    borderRadius: hasBackground ? Math.max(2, 8 * scale) : undefined,
  };
}

function buildShapeStyle(content: Record<string, unknown> | null | undefined, scale: number): CSSProperties {
  const shapeType = content?.shapeType;
  const strokeWidth = Number(content?.strokeWidth ?? 0) * scale;
  return {
    background: getShapeBackground(content),
    opacity: Number(content?.opacity ?? 1),
    borderRadius: getShapeBorderRadius(content, scale),
    clipPath: getShapeClipPath(shapeType),
    boxShadow: buildBoxShadow(content, scale),
    border: strokeWidth > 0 && isBorderFriendlyShape(shapeType)
      ? `${strokeWidth}px solid ${typeof content?.strokeColor === "string" ? content.strokeColor : "#000000"}`
      : undefined,
    boxSizing: "border-box",
    ...(shapeType === "line" ? { minHeight: Math.max(1, 3 * scale), borderRadius: 999 } : {}),
  };
}

export default function CollectionArtworkPreview({
  name,
  imageUrl,
  items,
  backgroundColor,
  backgroundStyle,
  backgroundImageUrl,
  canvasWidth,
  canvasHeight,
  className = "",
  imageFit = "cover",
  emptyTitle = "Aún no hay imagen promocional",
  emptyDescription = "Puedes subir una portada ya editada o diseñarla en canvas si quieres una imagen nueva.",
  renderedWidth,
}: CollectionArtworkPreviewProps) {
  const width = Math.max(1, Number(canvasWidth ?? 1080));
  const height = Math.max(1, Number(canvasHeight ?? 1080));
  const safeItems = Array.isArray(items) ? items : [];
  const hasCanvasArtwork = safeItems.length > 0;
  const background = backgroundStyle || backgroundColor || FALLBACK_BACKGROUND;

  // Scale all pixel-based values relative to how large the preview actually renders.
  // Fallback 0.18 keeps backward compat when renderedWidth is not provided.
  const previewScale = renderedWidth ? renderedWidth / width : 0.18;

  useEffect(() => {
    const needsFontSheet = safeItems.some((item) => {
      const fontFamily = item.element_type === "text" ? item.content?.fontFamily : null;
      return typeof fontFamily === "string" && fontFamily !== "inherit";
    });
    if (!needsFontSheet || typeof document === "undefined") return;

    const existingLink = document.querySelector<HTMLLinkElement>(`link[data-collection-fonts="true"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = GOOGLE_FONTS_URL;
    link.setAttribute("data-collection-fonts", "true");
    document.head.appendChild(link);
  }, [safeItems]);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        draggable={false}
        loading="lazy"
        className={`h-full w-full ${imageFit === "contain" ? "object-contain" : "object-cover"} ${className}`.trim()}
      />
    );
  }

  if (hasCanvasArtwork) {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`.trim()} style={{ background }}>
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt=""
            aria-hidden="true"
            draggable={false}
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {safeItems.slice().sort((a, b) => Number(a.z_index ?? 0) - Number(b.z_index ?? 0)).map((item, index) => {
          const left = `${(Number(item.pos_x ?? 0) / width) * 100}%`;
          const top = `${(Number(item.pos_y ?? 0) / height) * 100}%`;
          const itemWidth = `${Math.max(2, (Number(item.width ?? 40) / width) * 100)}%`;
          const itemHeight = `${Math.max(2, (Number(item.height ?? 20) / height) * 100)}%`;
          const rotation = Number((item.content as Record<string, unknown> | null | undefined)?.rotation ?? 0);
          const flipX = Boolean((item.content as Record<string, unknown> | null | undefined)?.flipX);
          const flipY = Boolean((item.content as Record<string, unknown> | null | undefined)?.flipY);
          const commonStyle: CSSProperties = {
            position: "absolute",
            left,
            top,
            width: itemWidth,
            height: itemHeight,
            overflow: "hidden",
            zIndex: Number(item.z_index ?? 0) + 1,
            transform: buildTransform(rotation, flipX, flipY),
            transformOrigin: "center center",
          };
          const content = (item.content ?? null) as Record<string, unknown> | null;
          const key = `${item.id ?? "canvas"}-${item.element_type}-${index}`;

          if (item.element_type === "text") {
            return (
              <div key={key} style={{ ...commonStyle, ...buildTextStyle(content, previewScale) }}>
                {typeof content?.text === "string" ? content.text : "Texto"}
              </div>
            );
          }

          if (item.element_type === "shape") {
            return <div key={key} style={{ ...commonStyle, ...buildShapeStyle(content, previewScale) }} />;
          }

          if (item.element_type === "image") {
            const imageSrc = typeof content?.url === "string" ? content.url : null;
            if (!imageSrc) return null;
            return (
              <img
                key={key}
                src={imageSrc}
                alt=""
                draggable={false}
                loading="lazy"
                style={{
                  ...commonStyle,
                  objectFit: content?.objectFit === "contain" ? "contain" : "cover",
                  borderRadius: `${Math.max(1, Number(content?.borderRadius ?? 8) * previewScale)}px`,
                  opacity: Number(content?.opacity ?? 1),
                  boxShadow: buildBoxShadow(content, previewScale),
                  display: "block",
                }}
              />
            );
          }

          if (item.element_type === "product") {
            if (item.product_image) {
              return (
                <img
                  key={key}
                  src={item.product_image}
                  alt={item.product_name ?? ""}
                  draggable={false}
                  loading="lazy"
                  style={{
                    ...commonStyle,
                    objectFit: content?.objectFit === "contain" ? "contain" : "cover",
                    borderRadius: `${Math.max(0, Number(content?.borderRadius ?? 0) * previewScale)}px`,
                    opacity: Number(content?.opacity ?? 1),
                    boxShadow: buildBoxShadow(content, previewScale),
                    display: "block",
                  }}
                />
              );
            }
            return (
              <div
                key={key}
                style={{
                  ...commonStyle,
                  background: "#dbe4ea",
                  borderRadius: `${Math.max(0, Number(content?.borderRadius ?? 0) * previewScale)}px`,
                  opacity: Number(content?.opacity ?? 1),
                  boxShadow: buildBoxShadow(content, previewScale),
                }}
              />
            );
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

// ---------------------------------------------------------------------------
// CollectionPreviewBox
// Sizes itself to the canvas aspect ratio, clamped by maxWidth / maxHeight.
// Measures its own rendered width via ResizeObserver and passes it to
// CollectionArtworkPreview so pixel-based canvas values scale correctly.
// ---------------------------------------------------------------------------

export type CollectionPreviewBoxProps = Omit<CollectionArtworkPreviewProps, "className" | "renderedWidth"> & {
  /** Max pixel width. Default 360. */
  maxWidth?: number;
  /** Max pixel height. Default 360. */
  maxHeight?: number;
  /** Classes applied to the outer wrapper (rounded, shadow, border, etc.). */
  className?: string;
  /** Overlay elements rendered on top of the artwork (badges, labels…). */
  children?: ReactNode;
};

export function CollectionPreviewBox({
  maxWidth = 360,
  maxHeight = 360,
  canvasWidth,
  canvasHeight,
  className = "",
  children,
  ...artworkProps
}: CollectionPreviewBoxProps) {
  const w = Math.max(1, Number(canvasWidth ?? 1080));
  const h = Math.max(1, Number(canvasHeight ?? 1080));
  // Largest width where neither dimension exceeds its maximum
  const effectiveMaxWidth = Math.min(maxWidth, Math.round(maxHeight * (w / h)));

  const boxRef = useRef<HTMLDivElement>(null);
  const [renderedWidth, setRenderedWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setRenderedWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className={`relative mx-auto overflow-hidden ${className}`.trim()}
      style={{
        aspectRatio: `${w} / ${h}`,
        width: "100%",
        maxWidth: `${effectiveMaxWidth}px`,
      }}
    >
      <CollectionArtworkPreview
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        renderedWidth={renderedWidth}
        {...artworkProps}
      />
      {children}
    </div>
  );
}
