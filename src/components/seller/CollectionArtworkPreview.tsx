"use client";

import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

type EntranceAnim = "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn";
type MotionAnim   = "none" | "float" | "pulse" | "spin" | "shake" | "bounce" | "heartbeat" | "swing" | "wiggle" | "breathe" | "rubber-band" | "tilt";

const MOTION_DURATION: Record<MotionAnim, string> = {
  none: "", float: "3s ease-in-out infinite", pulse: "2s ease-in-out infinite",
  spin: "4s linear infinite", shake: "0.5s ease-in-out infinite", bounce: "1s ease-in-out infinite",
  heartbeat: "1.2s ease-in-out infinite", swing: "2s ease-in-out infinite",
  wiggle: "1s ease-in-out infinite", breathe: "4s ease-in-out infinite",
  "rubber-band": "1.2s ease-in-out infinite", tilt: "3s ease-in-out infinite",
};
const ENTRANCE_DURATION: Record<EntranceAnim, string> = {
  none: "", fadeIn: "0.6s ease both", slideUp: "0.55s cubic-bezier(0.22,1,0.36,1) both",
  slideLeft: "0.55s cubic-bezier(0.22,1,0.36,1) both", zoomIn: "0.5s cubic-bezier(0.34,1.56,0.64,1) both",
};

const ANIM_KEYFRAMES = `
  @keyframes canvas-float      { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
  @keyframes canvas-pulse      { 0%,100%{transform:scale(1)}        50%{transform:scale(1.06)} }
  @keyframes canvas-spin       { from{transform:rotate(0deg)}       to{transform:rotate(360deg)} }
  @keyframes canvas-shake      { 0%,100%{transform:translateX(0)}   25%,75%{transform:translateX(-5px)} 50%{transform:translateX(5px)} }
  @keyframes canvas-bounce     { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
  @keyframes canvas-heartbeat  { 0%,100%{transform:scale(1)} 14%{transform:scale(1.08)} 28%{transform:scale(1)} 42%{transform:scale(1.05)} 70%{transform:scale(1)} }
  @keyframes canvas-swing      { 0%,100%{transform:rotate(0deg);transform-origin:top center} 25%{transform:rotate(10deg);transform-origin:top center} 75%{transform:rotate(-10deg);transform-origin:top center} }
  @keyframes canvas-wiggle     { 0%,100%{transform:rotateZ(0deg)} 15%{transform:rotateZ(5deg)} 30%{transform:rotateZ(-5deg)} 45%{transform:rotateZ(3deg)} 60%{transform:rotateZ(-3deg)} 75%{transform:rotateZ(1deg)} }
  @keyframes canvas-breathe    { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
  @keyframes canvas-rubber-band{ 0%,100%{transform:scaleX(1) scaleY(1)} 30%{transform:scaleX(1.18) scaleY(0.86)} 40%{transform:scaleX(0.88) scaleY(1.14)} 60%{transform:scaleX(1.08) scaleY(0.94)} 80%{transform:scaleX(0.98) scaleY(1.03)} }
  @keyframes canvas-tilt       { 0%,100%{transform:rotateZ(-1deg)} 50%{transform:rotateZ(1deg)} }
  @keyframes canvas-fadeIn     { from{opacity:0}                    to{opacity:1} }
  @keyframes canvas-slideUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes canvas-slideLeft  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes canvas-zoomIn     { from{opacity:0;transform:scale(0.72)} to{opacity:1;transform:scale(1)} }
`;

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
  /** @deprecated — no longer used; scale is derived internally via ResizeObserver */
  renderedWidth?: number | null;
  /** Play entrance + motion animations. Default false (thumbnails). */
  playAnimations?: boolean;
};

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@400;600;700&family=Lato:ital,wght@0,400;0,700;1,400&family=Raleway:wght@400;600;700&family=Oswald:wght@400;600;700&family=Pacifico&family=Dancing+Script:wght@400;700&family=Nunito:wght@400;600;700&family=Bebas+Neue&family=Satisfy&family=Abril+Fatface&family=Josefin+Sans:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700&family=Poppins:ital,wght@0,400;0,600;0,700;1,400&family=Work+Sans:wght@400;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700&family=Manrope:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Righteous&family=Fredoka+One&family=Russo+One&family=Baloo+2:wght@400;600;700&family=Great+Vibes&family=Sacramento&family=Space+Mono:ital,wght@0,400;0,700&display=swap";

const FALLBACK_BACKGROUND = "linear-gradient(135deg, #FFF8F0 0%, #F5EEE5 42%, #E9DFD2 100%)";

function buildTransform(rotation: number, flipX: boolean, flipY: boolean): string | undefined {
  const parts: string[] = [];
  if (rotation) parts.push(`rotate(${rotation}deg)`);
  if (flipX) parts.push("scaleX(-1)");
  if (flipY) parts.push("scaleY(-1)");
  return parts.length ? parts.join(" ") : undefined;
}

function buildBoxShadow(content: Record<string, unknown> | null | undefined): string | undefined {
  const shadowEnabled = Boolean(content?.shadowEnabled) || Boolean(content?.shadow);
  if (!shadowEnabled) return undefined;
  const shadowX = Number(content?.shadowX ?? 4);
  const shadowY = Number(content?.shadowY ?? 4);
  const shadowBlur = Number(content?.shadowBlur ?? 8);
  const shadowSpread = Number(content?.shadowSpread ?? 0);
  const shadowColor = typeof content?.shadowColor === "string" ? content.shadowColor : "rgba(0,0,0,0.3)";
  return `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`;
}

function buildCssFilter(content: Record<string, unknown> | null | undefined): string | undefined {
  if (!content) return undefined;
  const parts: string[] = [];
  const b = Number(content.filterBrightness ?? 100);
  const c = Number(content.filterContrast ?? 100);
  const s = Number(content.filterSaturation ?? 100);
  const h = Number(content.filterHue ?? 0);
  const bl = Number(content.filterBlur ?? 0);
  const se = Number(content.filterSepia ?? 0);
  const gr = Number(content.filterGrayscale ?? 0);
  if (b !== 100) parts.push(`brightness(${b}%)`);
  if (c !== 100) parts.push(`contrast(${c}%)`);
  if (s !== 100) parts.push(`saturate(${s}%)`);
  if (h !== 0)   parts.push(`hue-rotate(${h}deg)`);
  if (bl !== 0)  parts.push(`blur(${bl}px)`);
  if (se !== 0)  parts.push(`sepia(${se}%)`);
  if (gr !== 0)  parts.push(`grayscale(${gr}%)`);
  return parts.length > 0 ? parts.join(" ") : undefined;
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

function getShapeBorderRadius(content: Record<string, unknown> | null | undefined): string {
  const shapeType = content?.shapeType;
  if (shapeType === "circle") return "50%";
  if (shapeType === "capsule") return "999px";
  if (shapeType === "arch") return "999px 999px 18px 18px";
  if (shapeType === "blob") return "58% 42% 57% 43% / 39% 44% 56% 61%";
  if (shapeType === "triangle" || shapeType === "star" || shapeType === "line" || shapeType === "sparkle" || shapeType === "wave" || shapeType === "diamond") return "0";
  return `${Math.max(0, Number(content?.borderRadius ?? 8))}px`;
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

// All values in native canvas pixels — the parent div is CSS-scaled, so no multiplication needed.
function buildTextStyle(content: Record<string, unknown> | null | undefined): CSSProperties {
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
    fontSize: Number(content?.fontSize ?? 20),
    fontWeight,
    fontStyle: content?.fontStyle === "italic" ? "italic" : "normal",
    textAlign,
    lineHeight: Number(content?.lineHeight ?? 1.2),
    letterSpacing: `${Number(content?.letterSpacing ?? 0)}px`,
    padding: `${Number(content?.paddingY ?? 8)}px ${Number(content?.paddingX ?? 10)}px`,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontFamily: typeof content?.fontFamily === "string" ? content.fontFamily : "inherit",
    textShadow: content?.shadow
      ? `${Number(content?.shadowX ?? 2)}px ${Number(content?.shadowY ?? 2)}px ${Number(content?.shadowBlur ?? 4)}px ${typeof content?.shadowColor === "string" ? content.shadowColor : "#000000"}`
      : undefined,
    WebkitTextStroke: content?.outline
      ? `${Number(content?.outlineWidth ?? 1)}px ${typeof content?.outlineColor === "string" ? content.outlineColor : "#000000"}`
      : undefined,
    background: hasBackground ? hexToRgba(String(content.bgColor), Number(content?.bgOpacity ?? 0.6)) : undefined,
    borderRadius: hasBackground ? 8 : undefined,
  };
}

function buildShapeStyle(content: Record<string, unknown> | null | undefined): CSSProperties {
  const shapeType = content?.shapeType;
  const strokeWidth = Number(content?.strokeWidth ?? 0);
  return {
    background: getShapeBackground(content),
    opacity: Number(content?.opacity ?? 1),
    borderRadius: getShapeBorderRadius(content),
    clipPath: getShapeClipPath(shapeType),
    boxShadow: buildBoxShadow(content),
    border: strokeWidth > 0 && isBorderFriendlyShape(shapeType)
      ? `${strokeWidth}px solid ${typeof content?.strokeColor === "string" ? content.strokeColor : "#000000"}`
      : undefined,
    boxSizing: "border-box",
    ...(shapeType === "line" ? { minHeight: 3, borderRadius: 999 } : {}),
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
  playAnimations = false,
}: CollectionArtworkPreviewProps) {
  const width = Math.max(1, Number(canvasWidth ?? 1080));
  const height = Math.max(1, Number(canvasHeight ?? 1080));
  const safeItems = Array.isArray(items) ? items : [];
  const hasCanvasArtwork = safeItems.length > 0;
  const background = backgroundStyle || backgroundColor || FALLBACK_BACKGROUND;

  // Measure the container's actual rendered width to compute the CSS scale factor.
  // All canvas items are positioned at native canvas pixel coordinates inside a
  // native-sized div; a single CSS scale() on that div makes the preview pixel-perfect.
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !hasCanvasArtwork) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setCanvasScale(w / width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, hasCanvasArtwork]);

  useEffect(() => {
    if (!playAnimations || typeof document === "undefined") return;
    const styleId = "fj-canvas-keyframes";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = ANIM_KEYFRAMES;
    document.head.appendChild(style);
  }, [playAnimations]);

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
      <div
        ref={containerRef}
        className={`relative h-full w-full overflow-hidden ${className}`.trim()}
        style={{ background }}
      >
        {/* Background image fills the display container (same aspect ratio as canvas) */}
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

        {/* Canvas at native resolution, CSS-scaled to match rendered container width.
            This guarantees every element looks identical to the canvas editor. */}
        {canvasScale !== null ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              transformOrigin: "top left",
              transform: `scale(${canvasScale})`,
            }}
          >
            {safeItems
              .slice()
              .sort((a, b) => Number(a.z_index ?? 0) - Number(b.z_index ?? 0))
              .map((item, index) => {
                const itemLeft   = Number(item.pos_x ?? 0);
                const itemTop    = Number(item.pos_y ?? 0);
                const itemWidth  = Math.max(1, Number(item.width ?? 40));
                const itemHeight = Math.max(1, Number(item.height ?? 20));
                const rotation = Number((item.content as Record<string, unknown> | null | undefined)?.rotation ?? 0);
                const flipX = Boolean((item.content as Record<string, unknown> | null | undefined)?.flipX);
                const flipY = Boolean((item.content as Record<string, unknown> | null | undefined)?.flipY);

                const itemStyle: CSSProperties = {
                  position: "absolute",
                  left: `${itemLeft}px`,
                  top: `${itemTop}px`,
                  width: `${itemWidth}px`,
                  height: `${itemHeight}px`,
                  zIndex: Number(item.z_index ?? 0) + 1,
                  transform: buildTransform(rotation, flipX, flipY),
                  transformOrigin: "center center",
                };

                const content = (item.content ?? null) as Record<string, unknown> | null;
                const key = `${item.id ?? "canvas"}-${item.element_type}-${index}`;

                const motionKey   = (content?.motion    ?? "none") as MotionAnim;
                const entranceKey = (content?.animation ?? "none") as EntranceAnim;
                const motionStyle: CSSProperties = playAnimations && motionKey !== "none"
                  ? { animation: `canvas-${motionKey} ${MOTION_DURATION[motionKey]}` }
                  : {};
                const entranceStyle: CSSProperties = playAnimations && entranceKey !== "none"
                  ? { animation: `canvas-${entranceKey} ${ENTRANCE_DURATION[entranceKey]}`, animationDelay: `${Number(item.z_index ?? 0) * 100}ms` }
                  : {};

                // No overflow:hidden on wrappers — matches canvas editor behavior where items
                // are free to visually exceed their bounding box (shadows, rounded corners, etc.)
                const wrapWithAnim = (inner: React.ReactNode) => (
                  <div key={key} style={itemStyle}>
                    <div style={{ width: "100%", height: "100%", position: "relative", ...entranceStyle }}>
                      <div style={{ width: "100%", height: "100%", position: "relative", ...motionStyle }}>
                        {inner}
                      </div>
                    </div>
                  </div>
                );

                if (item.element_type === "text") {
                  return wrapWithAnim(
                    <div style={{ width: "100%", height: "100%", overflow: "hidden", ...buildTextStyle(content) }}>
                      {typeof content?.text === "string" ? content.text : "Texto"}
                    </div>
                  );
                }

                if (item.element_type === "shape") {
                  return wrapWithAnim(
                    <div style={{ width: "100%", height: "100%", ...buildShapeStyle(content) }} />
                  );
                }

                if (item.element_type === "image") {
                  const imageSrc = typeof content?.url === "string" ? content.url : null;
                  if (!imageSrc) return null;
                  return wrapWithAnim(
                    <img
                      src={imageSrc}
                      alt=""
                      draggable={false}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: content?.objectFit === "contain" ? "contain" : "cover",
                        borderRadius: `${Number(content?.borderRadius ?? 8)}px`,
                        opacity: Number(content?.opacity ?? 1),
                        boxShadow: buildBoxShadow(content),
                        filter: buildCssFilter(content),
                        display: "block",
                      }}
                    />
                  );
                }

                if (item.element_type === "product") {
                  if (item.product_image) {
                    return wrapWithAnim(
                      <img
                        src={item.product_image}
                        alt={item.product_name ?? ""}
                        draggable={false}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: content?.objectFit === "contain" ? "contain" : "cover",
                          borderRadius: `${Number(content?.borderRadius ?? 0)}px`,
                          opacity: Number(content?.opacity ?? 1),
                          boxShadow: buildBoxShadow(content),
                          filter: buildCssFilter(content),
                          display: "block",
                        }}
                      />
                    );
                  }
                  return wrapWithAnim(
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "#dbe4ea",
                        borderRadius: `${Number(content?.borderRadius ?? 0)}px`,
                        opacity: Number(content?.opacity ?? 1),
                        boxShadow: buildBoxShadow(content),
                      }}
                    />
                  );
                }

                return null;
              })}
          </div>
        ) : null}
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
// Wraps CollectionArtworkPreview in a container sized to the canvas aspect
// ratio, clamped by maxWidth / maxHeight. CollectionArtworkPreview measures
// its own rendered width internally — no need to pass renderedWidth here.
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
  const effectiveMaxWidth = Math.min(maxWidth, Math.round(maxHeight * (w / h)));

  return (
    <div
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
        {...artworkProps}
      />
      {children}
    </div>
  );
}
