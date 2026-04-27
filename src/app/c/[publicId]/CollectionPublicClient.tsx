"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
import {
  ArrowLeft,
  Store,
  Share2,
  Check,
  MessageCircle,
  ShoppingBag,
  ChevronDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { buildWhatsAppHref, extractWhatsAppPhone } from "@/lib/whatsapp";

// ── Types ─────────────────────────────────────────────────────────────────────

type Product = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
};

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

type CollectionData = {
  id: number;
  public_id: string | null;
  name: string;
  description: string | null;
  promo_image_url: string | null;
  background_image_url: string | null;
  background_color: string;
  background_style: string | null;
  canvas_width: number;
  canvas_height: number;
  product_count: number;
  products: Product[];
  items: CanvasItem[];
  seller: {
    nombre_comercio: string;
    user_id: number;
    logo_url: string | null;
    whatsapp?: string | null;
  } | null;
};

type OtherCollection = {
  id: number;
  public_id: string | null;
  name: string;
  description: string | null;
  promo_image_url: string | null;
  background_image_url: string | null;
  background_color: string;
  background_style: string | null;
  canvas_width: number;
  canvas_height: number;
  product_count?: number;
  item_count?: number;
  products?: { id: string; nombre: string; precio?: number | string | null; imagen_url?: string | null }[];
  items: CanvasItem[];
};

// ── Color system ──────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  if (clean.length >= 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  }
  const m = hex.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  return null;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
}

function hsl(h: number, s: number, l: number): string {
  const [r, g, b] = hslToRgb(h, Math.max(0, Math.min(1, s)), Math.max(0, Math.min(1, l)));
  return `rgb(${r},${g},${b})`;
}

type CollectionTheme = {
  accent: string;
  deep: string;
  ink: string;
  cream: string;
  surface: string;
  glow12: string;
  glow20: string;
  glow40: string;
  isLight: boolean;
};

function buildTheme(backgroundColor: string): CollectionTheme | null {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);
  if (s < 0.12 || l > 0.93 || l < 0.07) return null;
  return {
    accent: `rgb(${r},${g},${b})`,
    deep: hsl(h, Math.min(s * 1.05, 1), Math.max(l * 0.52, 0.12)),
    ink: hsl(h, s * 0.25, 0.11),
    cream: hsl(h, Math.min(s * 0.28, 0.2), 0.965),
    surface: hsl(h, Math.min(s * 0.1, 0.07), 0.988),
    glow12: `rgba(${r},${g},${b},0.12)`,
    glow20: `rgba(${r},${g},${b},0.20)`,
    glow40: `rgba(${r},${g},${b},0.40)`,
    isLight: l > 0.6,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CollectionPublicClient({
  collection,
}: {
  collection: CollectionData;
}) {
  const { seller, products } = collection;
  const storeHref = seller?.user_id ? `/store/${seller.user_id}` : "/";

  const [shared, setShared] = useState(false);
  const [descOpen, setDescOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [otherCollections, setOtherCollections] = useState<OtherCollection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasExpanded, setCanvasExpanded] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const theme = useMemo(() => buildTheme(collection.background_color), [collection.background_color]);

  // Load editorial fonts
  useEffect(() => {
    const id = "fj-editorial-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=JetBrains+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  // Poster entrance animation
  useEffect(() => {
    const t = setTimeout(() => setPosterReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Fetch other collections from the same seller
  useEffect(() => {
    if (!seller?.user_id) return;
    fetch(`${API}/api/collections/public/seller/${seller.user_id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.ok) {
          setOtherCollections((data.data ?? []).filter((c: OtherCollection) => c.id !== collection.id));
        }
      })
      .catch(() => {})
      .finally(() => setCollectionsLoading(false));
  }, [seller?.user_id, collection.id]);

  // Parallax scroll tracking
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Sticky bar: shows once the hero leaves the viewport
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Fullscreen sync (user can also exit with Esc)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch { /* browser may not support fullscreen API */ }
  }, []);

  // Close canvas lightbox on Escape
  useEffect(() => {
    if (!canvasExpanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setCanvasExpanded(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canvasExpanded]);

  const whatsappPhone = seller?.whatsapp ? extractWhatsAppPhone(seller.whatsapp) : null;
  const whatsappHref = whatsappPhone
    ? buildWhatsAppHref(whatsappPhone, `Hola! Vi la colección "${collection.name}" en Flowjuyu y me gustaría saber más.`)
    : null;

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: collection.name, text: `Mira esta colección: ${collection.name}`, url };
    try {
      if (navigator.share && navigator.canShare?.(data)) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch {
      try { await navigator.clipboard.writeText(url); setShared(true); setTimeout(() => setShared(false), 2500); }
      catch { /* silent */ }
    }
  }, [collection.name]);

  const textOnHero = theme?.isLight ? theme.ink : "#ffffff";
  const metaOnHero = theme?.isLight ? theme.deep : "rgba(255,255,255,0.65)";
  const heroGradient = theme
    ? `linear-gradient(180deg, ${theme.accent} 0%, ${theme.accent} 60%, ${theme.cream} 100%)`
    : "linear-gradient(180deg, #ddd8d0 0%, #ddd8d0 60%, #f5f3f0 100%)";

  const parallaxOffset = Math.min(scrollY * 0.15, 60);

  return (
    <div style={{ minHeight: "100vh", background: theme?.surface ?? "#f8f7f5" }}>

      {/* ── Desktop color rail (Direction B) ── */}
      {theme && (
        <div
          aria-hidden
          className="hidden lg:block"
          style={{
            position: "fixed", top: 0, left: 0, bottom: 0, width: 3, zIndex: 25,
            background: `linear-gradient(to bottom, ${theme.accent} 0%, ${theme.accent} 35%, ${theme.glow20} 65%, transparent 100%)`,
          }}
        />
      )}

      {/* ── Sticky nav ── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-sm"
        style={{
          background: isFullscreen
            ? theme ? `${theme.deep}cc` : "rgba(20,18,15,0.80)"
            : "rgba(255,255,255,0.92)",
          borderBottomColor: isFullscreen
            ? theme ? theme.glow20 : "rgba(255,255,255,0.12)"
            : "#f3f4f6",
          transition: "background 400ms ease, border-color 400ms ease",
        }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          {!isFullscreen && (
            <a
              href={storeHref}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver a la tienda</span>
            </a>
          )}
          <div className={`flex items-center gap-2 ${isFullscreen ? "w-full justify-between" : "ml-auto"}`}>
            {!isFullscreen && (
              <a
                href={storeHref}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                {seller?.logo_url ? (
                  <img src={seller.logo_url} alt={seller.nombre_comercio} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100">
                    <Store className="h-3.5 w-3.5 text-neutral-400" />
                  </div>
                )}
                <span className="text-xs font-medium text-neutral-700">
                  {seller?.nombre_comercio ?? "Tienda"}
                </span>
              </a>
            )}
            {isFullscreen && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {seller?.logo_url && (
                  <img src={seller.logo_url} alt={seller.nombre_comercio} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", opacity: 0.9 }} />
                )}
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 18, fontWeight: 500, fontStyle: "italic",
                  color: theme?.isLight ? theme.ink : "#fff",
                  letterSpacing: "-0.01em",
                }}>
                  {collection.name}
                </span>
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Salir de pantalla completa (Esc)" : "Ver en pantalla completa"}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: isFullscreen
                  ? "rgba(255,255,255,0.12)"
                  : "transparent",
                border: isFullscreen
                  ? "1px solid rgba(255,255,255,0.2)"
                  : "1px solid #e5e7eb",
                cursor: "pointer",
                color: isFullscreen
                  ? (theme?.isLight ? theme.ink : "#fff")
                  : "#6b7280",
                transition: "background 200ms, border-color 200ms, color 200ms",
              }}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero: Color Wash Cinema ── */}
      <section ref={heroRef} style={{ background: heroGradient, overflow: "hidden" }}>
        <div
          style={{
            maxWidth: 900, margin: "0 auto", padding: "48px 20px 0",
            transform: `translateY(${parallaxOffset}px)`,
            willChange: "transform",
          }}
        >

          {/* Collection identity */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {seller?.logo_url && (
              <img
                src={seller.logo_url}
                alt={seller.nombre_comercio}
                style={{
                  width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
                  margin: "0 auto 12px", display: "block",
                  boxShadow: "0 0 0 2px rgba(255,255,255,0.4)",
                }}
              />
            )}
            <p style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: "0.32em", textTransform: "uppercase",
              color: metaOnHero, margin: "0 0 12px",
            }}>
              {seller?.nombre_comercio ?? "Colección"}
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(38px, 9vw, 86px)",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
              lineHeight: 1.0,
              color: textOnHero,
              margin: 0,
            }}>
              {collection.name}
            </h1>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 22 }}>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    padding: "10px 20px", borderRadius: 99,
                    background: "#25d366", color: "#fff",
                    fontWeight: 600, fontSize: 13.5, textDecoration: "none",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                  }}
                >
                  <MessageCircle size={15} />
                  Contactar
                </a>
              )}
              <button
                onClick={handleShare}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "10px 20px", borderRadius: 99,
                  background: theme?.isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)",
                  color: textOnHero,
                  border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: 13.5,
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                }}
              >
                {shared
                  ? <><Check size={15} /> Copiado</>
                  : <><Share2 size={15} /> Compartir</>}
              </button>
            </div>
          </div>

          {/* Canvas poster */}
          <div style={{ position: "relative" }}>
            {theme && (
              <div
                aria-hidden
                style={{
                  position: "absolute", inset: 0, bottom: -28,
                  borderRadius: 32, background: theme.glow40,
                  filter: "blur(36px)", zIndex: 0,
                }}
              />
            )}
            <div
              role="button"
              tabIndex={0}
              aria-label="Ver canvas en pantalla completa"
              onClick={() => setCanvasExpanded(true)}
              onKeyDown={(e) => e.key === "Enter" && setCanvasExpanded(true)}
              style={{
                position: "relative", zIndex: 1,
                borderRadius: 18, overflow: "hidden",
                boxShadow: "0 24px 72px rgba(0,0,0,0.26), 0 4px 16px rgba(0,0,0,0.10)",
                transform: posterReady ? "scale(1)" : "scale(0.97)",
                transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)",
                cursor: "zoom-in",
              }}
            >
              <CollectionPreviewBox
                name={collection.name}
                imageUrl={
                  !(collection.items?.length)
                    ? (collection.promo_image_url ?? collection.background_image_url ?? null)
                    : null
                }
                backgroundImageUrl={collection.background_image_url ?? undefined}
                items={collection.items}
                backgroundColor={collection.background_color}
                backgroundStyle={collection.background_style}
                canvasWidth={collection.canvas_width}
                canvasHeight={collection.canvas_height}
                maxWidth={1200}
                maxHeight={700}
                className="w-full"
                playAnimations
              />
              {/* Expand hint — top-right corner */}
              <div
                aria-hidden
                style={{
                  position: "absolute", top: 12, right: 12,
                  width: 32, height: 32, borderRadius: 8,
                  background: "rgba(0,0,0,0.36)",
                  backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", pointerEvents: "none",
                }}
              >
                <Maximize2 size={14} />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 32px" }}>
            <div
              aria-hidden
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                animation: "fj-bounce 2s ease-in-out infinite",
                opacity: 0.6,
              }}
            >
              <div style={{
                width: 1, height: 24,
                background: theme?.isLight ? theme.ink : "rgba(255,255,255,0.5)",
              }} />
              <ChevronDown
                size={14}
                style={{ color: theme?.isLight ? theme.ink : "rgba(255,255,255,0.7)" }}
              />
            </div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes fj-bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(6px); }
            }
            @keyframes fj-shimmer {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.45; }
            }
          `}} />
        </div>
      </section>

      {/* ── Body ── */}
      <div style={{ background: theme?.surface ?? "#f8f7f5" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px 120px" }}>

          {/* Description accordion */}
          {collection.description && (
            <div
              style={{
                margin: "32px 0 0",
                borderRadius: 12,
                background: theme?.cream ?? "#f0ece4",
                border: `1px solid ${theme?.glow12 ?? "#e5e7eb"}`,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setDescOpen(!descOpen)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "14px 18px",
                  background: "none", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.26em", textTransform: "uppercase",
                  color: theme?.deep ?? "#6b7280",
                }}>
                  Sobre esta colección
                </span>
                <ChevronDown
                  size={16}
                  style={{
                    color: theme?.deep ?? "#6b7280",
                    transform: descOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 200ms ease",
                    flexShrink: 0,
                  }}
                />
              </button>
              {descOpen && (
                <div style={{ padding: "0 18px 18px" }}>
                  <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: "#4a4540" }}>
                    {collection.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <section style={{ paddingTop: 40 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {theme && (
                    <span style={{ display: "block", width: 3, height: 18, borderRadius: 2, background: theme.accent }} />
                  )}
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
                    color: theme?.deep ?? "#9ca3af",
                  }}>
                    Piezas · {products.length}
                  </span>
                </div>
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, fontWeight: 500, color: theme?.deep ?? "#059669", textDecoration: "none" }}
                  >
                    Preguntar precio →
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} theme={theme} />
                ))}
              </div>
            </section>
          )}

          {/* Seller card */}
          <div
            style={{
              marginTop: 52,
              borderRadius: 16,
              border: `1px solid ${theme?.glow12 ?? "#efefef"}`,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            {theme && <div style={{ height: 3, background: theme.accent }} />}
            <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {seller?.logo_url ? (
                  <img
                    src={seller.logo_url}
                    alt={seller.nombre_comercio}
                    className="h-12 w-12 rounded-full object-cover"
                    style={{ boxShadow: `0 0 0 2px ${theme?.glow20 ?? "#e5e7eb"}` }}
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                    <Store className="h-6 w-6 text-neutral-400" />
                  </div>
                )}
                <div>
                  <p style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
                    color: theme?.deep ?? "#9ca3af", margin: "0 0 4px",
                  }}>
                    Vendedor
                  </p>
                  <p className="text-base font-semibold text-neutral-900" style={{ margin: 0 }}>
                    {seller?.nombre_comercio ?? "Tienda"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
                <a
                  href={storeHref}
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                >
                  Ver tienda →
                </a>
              </div>
            </div>
          </div>
          {/* ── Más colecciones ── */}
          {(collectionsLoading || otherCollections.length > 0) && (
            <section style={{ marginTop: 56 }}>
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase",
                  color: theme?.deep ?? "#9ca3af", margin: "0 0 6px",
                }}>
                  Más colecciones
                </p>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <h2 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(22px, 5vw, 32px)",
                    fontWeight: 500, fontStyle: "italic",
                    letterSpacing: "-0.015em", lineHeight: 1.1,
                    color: "#1c1a17", margin: 0,
                  }}>
                    De {seller?.nombre_comercio ?? "este vendedor"}
                  </h2>
                  <a
                    href={storeHref}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                      color: theme?.deep ?? "#6b7280", textDecoration: "none", flexShrink: 0,
                    }}
                  >
                    Ver tienda →
                  </a>
                </div>
              </div>

              {/* Horizontal scroll on mobile, grid on desktop */}
              <div style={{ overflowX: "auto", margin: "0 -20px", padding: "0 20px 12px", scrollbarWidth: "none" }}>
                <div style={{ display: "flex", gap: 14, width: "max-content" }}
                  className="sm:grid sm:grid-cols-2 sm:w-auto lg:grid-cols-3"
                >
                {collectionsLoading && [0, 1, 2].map((i) => (
                  <div key={i} style={{
                    width: 280, minWidth: 280, borderRadius: 16, overflow: "hidden",
                    border: `1px solid ${theme?.glow12 ?? "#efefef"}`, background: "#fff",
                  }}>
                    <div style={{ height: 3, background: theme?.glow12 ?? "#f0f0f0" }} />
                    <div style={{ height: 200, background: theme?.glow12 ?? "#f5f5f5", animation: "fj-shimmer 1.6s ease-in-out infinite" }} />
                    <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ height: 10, width: "60%", borderRadius: 4, background: theme?.glow12 ?? "#f0f0f0" }} />
                      <div style={{ height: 22, width: "80%", borderRadius: 4, background: theme?.glow12 ?? "#f0f0f0" }} />
                      <div style={{ height: 60, borderRadius: 8, background: theme?.glow12 ?? "#f0f0f0" }} />
                    </div>
                  </div>
                ))}
                  {otherCollections.slice(0, 6).map((col) => {
                    const href = col.public_id ? `/c/${col.public_id}` : null;
                    const totalProducts = col.product_count ?? col.item_count ?? col.products?.length ?? col.items?.length ?? 0;
                    const previews = (col.products ?? []).slice(0, 4);

                    return (
                      <article
                        key={col.id}
                        style={{
                          borderRadius: 16,
                          border: `1px solid ${theme?.glow12 ?? "#efefef"}`,
                          background: "#fff",
                          overflow: "hidden",
                          minWidth: 280, width: 280,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Color accent strip derived from this collection's own color */}
                        <div style={{ height: 3, background: col.background_color ?? theme?.accent ?? "#e5e7eb" }} />

                        {/* Mini canvas preview */}
                        {href ? (
                          <a href={href} style={{ display: "block" }}>
                            <CollectionPreviewBox
                              name={col.name}
                              imageUrl={!(col.items?.length) ? (col.promo_image_url ?? col.background_image_url ?? null) : null}
                              backgroundImageUrl={col.background_image_url ?? undefined}
                              items={col.items ?? []}
                              backgroundColor={col.background_color}
                              backgroundStyle={col.background_style}
                              canvasWidth={col.canvas_width}
                              canvasHeight={col.canvas_height}
                              maxWidth={480}
                              maxHeight={340}
                              className="w-full"
                            />
                          </a>
                        ) : (
                          <CollectionPreviewBox
                            name={col.name}
                            imageUrl={!(col.items?.length) ? (col.promo_image_url ?? col.background_image_url ?? null) : null}
                            backgroundImageUrl={col.background_image_url ?? undefined}
                            items={col.items ?? []}
                            backgroundColor={col.background_color}
                            backgroundStyle={col.background_style}
                            canvasWidth={col.canvas_width}
                            canvasHeight={col.canvas_height}
                            maxWidth={480}
                            maxHeight={340}
                            className="w-full"
                          />
                        )}

                        <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                          <div>
                            <p style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                              color: theme?.deep ?? "#9ca3af", margin: "0 0 4px",
                            }}>
                              Colección · {totalProducts} {totalProducts === 1 ? "pieza" : "piezas"}
                            </p>
                            <h3 style={{
                              fontFamily: "'Cormorant Garamond', serif",
                              fontSize: 20, fontWeight: 500, fontStyle: "italic",
                              letterSpacing: "-0.01em", lineHeight: 1.1,
                              color: "#1c1a17", margin: 0,
                            }}>
                              {col.name}
                            </h3>
                          </div>

                          {/* Product thumbnails */}
                          {previews.length > 0 && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
                              {previews.map((p) => (
                                <div key={p.id} style={{
                                  display: "flex", alignItems: "center", gap: 8,
                                  padding: "6px 8px", borderRadius: 10,
                                  border: "1px solid #f0efed", background: "#fafafa",
                                }}>
                                  <div style={{ width: 32, height: 32, borderRadius: 6, overflow: "hidden", background: "#f0efed", flexShrink: 0 }}>
                                    {p.imagen_url ? (
                                      <img src={p.imagen_url} alt={p.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      <ShoppingBag size={14} style={{ color: "#d1d5db", margin: "9px auto", display: "block" }} />
                                    )}
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <p style={{ fontSize: 11, fontWeight: 500, color: "#1c1a17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                                      {p.nombre}
                                    </p>
                                    {p.precio != null && (
                                      <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
                                        Q{Number(p.precio).toFixed(0)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {href && (
                            <a
                              href={href}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                padding: "10px 16px", borderRadius: 12, marginTop: "auto",
                                border: `1px solid ${theme?.glow20 ?? "#e5e7eb"}`,
                                background: "transparent",
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
                                color: theme?.deep ?? "#374151", textDecoration: "none",
                                transition: "background 180ms",
                              }}
                            >
                              Ver colección →
                            </a>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ── Canvas lightbox ── */}
      {canvasExpanded && (
        <div
          onClick={() => setCanvasExpanded(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 70,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
            animation: "fj-fade-in 220ms ease",
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes fj-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fj-scale-in { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}} />

          {/* Close button */}
          <button
            onClick={() => setCanvasExpanded(false)}
            style={{
              position: "absolute", top: 16, right: 16,
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <Minimize2 size={16} />
          </button>

          {/* Collection label */}
          <div style={{ position: "absolute", top: 20, left: 24, display: "flex", alignItems: "center", gap: 10 }}>
            {seller?.logo_url && (
              <img src={seller.logo_url} alt={seller.nombre_comercio} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", opacity: 0.85 }} />
            )}
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 16, fontWeight: 500, fontStyle: "italic",
              color: "rgba(255,255,255,0.85)", letterSpacing: "-0.01em",
            }}>
              {collection.name}
            </span>
          </div>

          {/* Canvas — stop propagation so clicking canvas doesn't close overlay */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 1100,
              borderRadius: 20, overflow: "hidden",
              boxShadow: theme
                ? `0 0 0 1px ${theme.glow20}, 0 40px 120px rgba(0,0,0,0.6)`
                : "0 40px 120px rgba(0,0,0,0.6)",
              animation: "fj-scale-in 280ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {theme && (
              <div style={{ height: 3, background: theme.accent }} />
            )}
            <CollectionPreviewBox
              name={collection.name}
              imageUrl={
                !(collection.items?.length)
                  ? (collection.promo_image_url ?? collection.background_image_url ?? null)
                  : null
              }
              backgroundImageUrl={collection.background_image_url ?? undefined}
              items={collection.items}
              backgroundColor={collection.background_color}
              backgroundStyle={collection.background_style}
              canvasWidth={collection.canvas_width}
              canvasHeight={collection.canvas_height}
              maxWidth={1920}
              maxHeight={900}
              className="w-full"
              playAnimations
            />
          </div>

          {/* Hint */}
          <p style={{
            position: "absolute", bottom: 18,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}>
            Esc o clic fuera para cerrar
          </p>
        </div>
      )}

      {/* ── Mobile sticky WhatsApp bar ── */}
      {whatsappHref && (
        <div
          className="sm:hidden"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(14px)",
            borderTop: `1px solid ${theme?.glow20 ?? "#e5e7eb"}`,
            padding: "12px 16px",
            paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
            transform: showStickyBar ? "translateY(0)" : "translateY(100%)",
            transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              {seller?.logo_url ? (
                <img
                  src={seller.logo_url}
                  alt={seller.nombre_comercio}
                  style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Store size={14} style={{ color: "#9ca3af" }} />
                </div>
              )}
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1c1a17", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {seller?.nombre_comercio ?? "Vendedor"}
              </span>
            </div>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "10px 18px", borderRadius: 99,
                background: "#25d366", color: "#fff",
                fontWeight: 600, fontSize: 14, textDecoration: "none", flexShrink: 0,
              }}
            >
              <MessageCircle size={16} />
              Contactar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
  product,
  index,
  theme,
}: {
  product: Product;
  index: number;
  theme: CollectionTheme | null;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.08, rootMargin: "0px 0px -28px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const delay = index < 8 ? index * 65 : 0;
  const num = String(index + 1).padStart(2, "0");

  return (
    <a
      ref={ref}
      href={`/product/${product.id}`}
      style={{
        display: "block", textDecoration: "none",
        borderRadius: 14, overflow: "hidden",
        background: "#fff",
        border: `1px solid ${hovered && theme ? theme.glow40 : "#f0efed"}`,
        boxShadow: hovered
          ? theme
            ? `0 8px 28px ${theme.glow20}, 0 2px 8px rgba(0,0,0,0.07)`
            : "0 6px 20px rgba(0,0,0,0.1)"
          : "0 1px 4px rgba(0,0,0,0.05)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 420ms ease ${delay}ms, transform 420ms ease ${delay}ms, border-color 180ms, box-shadow 180ms`,
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Number tag */}
      <div style={{ padding: "8px 11px 3px" }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9, letterSpacing: "0.14em",
          color: theme ? theme.deep : "#c4b9ac",
        }}>
          ─{num}
        </span>
      </div>

      {/* Image */}
      <div style={{ aspectRatio: "1", overflow: "hidden", background: "#f7f5f2" }}>
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 420ms ease",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShoppingBag size={28} style={{ color: "#d1d5db" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "9px 11px 12px" }}>
        <p style={{
          margin: 0, fontSize: 13, fontWeight: 500, color: "#1c1a17",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {product.nombre}
        </p>
        {product.precio != null && (
          <p style={{ margin: "3px 0 0", fontSize: 13, fontWeight: 700, color: theme?.deep ?? "#1c1a17" }}>
            Q{Number(product.precio) % 1 === 0 ? Number(product.precio).toFixed(0) : Number(product.precio).toFixed(2)}
          </p>
        )}
      </div>
    </a>
  );
}
