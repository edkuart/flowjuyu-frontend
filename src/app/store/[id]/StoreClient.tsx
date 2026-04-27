//src/app/store/[id]/StoreClient.tsx

"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";
import Image from "next/image";
import Link from "next/link";
import { getProductImage } from "@/lib/getProductImage";
import {
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle,
  MapPin,
  Music2,
  ShieldCheck,
  Star,
  BookOpen,
  Share2,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { FollowButton } from "@/components/seller/FollowButton";
import ProductDiscoveryLayout from "@/components/product/discovery/ProductDiscoveryLayout";
import ProductCardV2 from "@/components/product/ProductCardV2";
import CollectionArtworkPreview, { CollectionPreviewBox } from "@/components/seller/CollectionArtworkPreview";
import { ProductDetailsBlock } from "@/components/product/ProductDetailsBlock";
import SellerQrModal from "@/components/seller/SellerQrModal";
import SocialButtons from "@/components/seller/SocialButtons";
import { SellerLogo } from "@/components/seller/SellerLogo";
import WhatsAppModal from "@/components/product/WhatsAppModal";
import { FloatingActionDock } from "@/components/ui/FloatingActionDock";
import { buildHeaderStyle, DEFAULT_HEADER_STYLE } from "@/lib/headerStyle";
import type { HeaderStyle } from "@/lib/headerStyle";
import { trackEvent } from "@/lib/analytics";
import { getLivePlatformLabel, getLivePlatformTheme } from "@/lib/liveExternal";
import { LEGAL_WHATSAPP_NOTICE } from "@/lib/legal";
import type { PhoneNumber } from "@/lib/phone";
import { buildWhatsAppHref, extractWhatsAppPhone } from "@/lib/whatsapp";
import type { ProductAtributos } from "@/types/product-edit";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

/* =====================================================
   TYPES
===================================================== */

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  descripcion?: string | null;
  imagen_url?: string | null;
  imagenes?: { url: string }[];
  internal_code?: string | null;
  atributos?: ProductAtributos | null;
};

type LiveFeaturedProduct = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
  internal_code?: string | null;
  sku?: string | null;
};

type Seller = {
  id: number;
  user_id?: number | null;
  nombre_comercio: string;
  descripcion?: string | null;
  logo?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  banner_url?: string | null;
  identidad_tags?: string[] | null;
  productos_destacados?: string[] | null;
  mensaje_destacado?: string | null;
  created_at?: string | null;
  whatsapp?: string | null; // legacy string (some endpoints still return this)
  whatsapp_numero?: PhoneNumber | null;
  plan?: "free" | "founder";
  plan_activo?: boolean;
  estado_validacion?: "pendiente" | "aprobado" | "rechazado";
  instagram?: string | null;
  facebook?: string | null;
  tiktok?: string | null;
  header_style?: HeaderStyle | null;
  is_live?: boolean;
  live_started_at?: string | null;
  live_message?: string | null;
  live_external_url?: string | null;
  live_platform?: "tiktok" | "instagram" | "facebook" | null;
  live_external_preview?: {
    title?: string | null;
    description?: string | null;
    image_url?: string | null;
    site_name?: string | null;
    canonical_url?: string | null;
  } | null;
  live_featured_products?: LiveFeaturedProduct[];
  live_current_product?: LiveFeaturedProduct | null;
  live_collection_id?: number | null;
};

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  buyer_name: string;
  product_nombre: string | null;
  created_at: string;
};

type RatingSummary = { rating: number; total_reviews: number };

type CollectionItem = {
  id: number;
  element_type?: "product" | "text" | "shape" | "image";
  content?: Record<string, any> | null;
  product_id: string | null;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  z_index: number;
  product_name: string | null;
  product_image: string | null;
  product_price: number | null;
  internal_code: string | null;
};

type PublicCollectionProduct = {
  id: string;
  nombre: string;
  precio?: number | string | null;
  imagen_url?: string | null;
  internal_code?: string | null;
  seller_sku?: string | null;
};

type PublicCollection = {
  id: number;
  public_id?: string | null;
  name: string;
  description: string | null;
  promo_image_url?: string | null;
  background_color: string;
  background_style: string | null;
  background_image_url: string | null;
  canvas_width: number;
  canvas_height: number;
  created_at: string;
  item_count?: number;
  product_count?: number;
  products?: PublicCollectionProduct[];
  items: CollectionItem[];
};

function buildCollectionBoxShadow(content?: Record<string, any> | null): string | undefined {
  if (!content?.shadowEnabled) return undefined;
  return `${content.shadowX ?? 4}px ${content.shadowY ?? 4}px ${content.shadowBlur ?? 8}px ${content.shadowSpread ?? 0}px ${content.shadowColor ?? "rgba(0,0,0,0.3)"}`;
}

function buildCollectionBgRgba(content?: Record<string, any> | null): string | undefined {
  if (!content?.bgColor) return undefined;
  const hex = content.bgColor as string;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${content.bgOpacity ?? 0.6})`;
}

// HeaderStyle, DEFAULT_HEADER_STYLE, buildHeaderStyle — imported from @/lib/headerStyle

// Re-export so existing imports from this file keep working
export type { HeaderStyle } from "@/lib/headerStyle";

type StoreLayoutConfig = {
  show_story: boolean;
  show_reviews: boolean;
  show_featured: boolean;
};

const DEFAULT_LAYOUT: StoreLayoutConfig = {
  show_story: true,
  show_reviews: true,
  show_featured: true,
};

/* =====================================================
   STAR DISPLAY
===================================================== */

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "lg";
}) {
  const s = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${s} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
}


/* =====================================================
   REVIEW FORM
===================================================== */

function ReviewForm({
  sellerId,
  onSubmitted,
}: {
  sellerId: number;
  onSubmitted: () => void;
}) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError(tr("seller.reviewSelectRating"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/reviews/seller/${sellerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          comment: comment || null,
          buyer_name: name || "Comprador",
        }),
      });
      if (res.status === 409) {
        setError(tr("seller.reviewDuplicate"));
        return;
      }
      if (!res.ok) throw new Error();
      setSuccess(true);
      onSubmitted();
    } catch {
      setError(tr("seller.reviewError"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-6 text-center font-semibold text-emerald-700">
        {tr("seller.reviewSuccess")} 🙏
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-5"
    >
      <p className="text-sm font-semibold text-neutral-800">
        {tr("seller.reviewFormTitle")}
      </p>

      {/* Star selector */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(n)}
          >
            <Star
              className={`h-7 w-7 transition ${
                n <= (hovered || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>

      <input
        placeholder={tr("seller.reviewNamePlaceholder")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
      />
      <textarea
        placeholder={tr("seller.reviewCommentPlaceholder")}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-xl border bg-white px-3 py-2 text-sm"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[#0F3D3A] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a2e2b] disabled:opacity-60"
      >
        {loading ? tr("seller.reviewSubmitting") : tr("seller.reviewSubmit")}
      </button>
    </form>
  );
}

function detectLiveSource() {
  if (typeof window === "undefined") return "direct";

  const params = new URLSearchParams(window.location.search);
  const source = params.get("source");

  if (source === "home" || source === "notification" || source === "direct") {
    return source;
  }

  if (document.referrer.toLowerCase().includes("home")) {
    return "home";
  }

  return "direct";
}

/* =====================================================
   COMPONENT
===================================================== */

export default function StoreClient({
  seller,
  initialProducts,
  layoutConfig,
}: {
  seller: Seller;
  initialProducts: Producto[];
  layoutConfig?: Partial<StoreLayoutConfig>;
}) {
  const { dictionary } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const { user } = useAuth();
  const router   = useRouter();
  console.log("[DEBUG] Component render triggered");
  console.log("[DEBUG] seller object:", seller);
  console.log("[DEBUG] seller.id:", seller?.id, "| type:", typeof seller?.id);
  console.log(
    "[DEBUG] initialProducts:",
    Array.isArray(initialProducts)
      ? `array[${initialProducts.length}]`
      : initialProducts,
  );
  const config = useMemo<StoreLayoutConfig>(
    () => ({ ...DEFAULT_LAYOUT, ...layoutConfig }),
    // layoutConfig is expected to be a stable object from the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(layoutConfig)],
  );
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(2000);
  const [sort, setSort] = useState("");
  const [fabVisible, setFabVisible] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [whatsAppProduct, setWhatsAppProduct] =
    useState<LiveFeaturedProduct | null>(null);
  const [mobileDockSection, setMobileDockSection] = useState<
    "catalog" | "collections" | "reviews"
  >("catalog");
  const catalogSectionRef = useRef<HTMLElement | null>(null);
  const reviewsSectionRef = useRef<HTMLElement | null>(null);
  const collectionsSectionRef = useRef<HTMLElement | null>(null);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [currentLiveProduct, setCurrentLiveProduct] =
    useState<LiveFeaturedProduct | null>(seller.live_current_product ?? null);
  const [isCurrentLiveProductChanging, setIsCurrentLiveProductChanging] =
    useState(false);

  // Reviews
  const [ratingSummary, setRatingSummary] = useState<RatingSummary | null>(
    null,
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Collections
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const publicStoreId = Number(seller.user_id ?? seller.id);

  console.log("[DEBUG] Render ratingSummary:", ratingSummary);

  /* ── Trace ratingSummary state changes ── */
  useEffect(() => {
    if (ratingSummary === null) {
      console.log(
        "[DEBUG] Showing skeleton — ratingSummary is:",
        ratingSummary,
      );
    } else {
      console.log(
        "[DEBUG] ratingSummary set — rating:",
        ratingSummary.rating,
        "total_reviews:",
        ratingSummary.total_reviews,
      );
      if (ratingSummary.total_reviews === 0) {
        console.warn(
          "[DEBUG] total_reviews is 0 — rating badge will NOT render",
        );
      }
    }
  }, [ratingSummary]);

  /* ── Mount diagnostics ── */
  useEffect(() => {
    console.log(
      "[DEBUG] MOUNT — seller.id:",
      seller?.id,
      "| initialProducts.length:",
      initialProducts?.length,
    );
    console.log("[DEBUG] MOUNT — config:", config);
    console.log(
      "[DEBUG] MOUNT — seller.descripcion:",
      !!seller?.descripcion,
      "| seller.plan:",
      seller?.plan,
      "| estado_validacion:",
      seller?.estado_validacion,
    );
    console.log(
      "[DEBUG] MOUNT — productos_destacados:",
      seller?.productos_destacados?.length ?? 0,
      "| identidad_tags:",
      seller?.identidad_tags?.length ?? 0,
    );
    if (!seller?.id)
      console.error("[DEBUG] BLOCKER — seller.id is missing! seller:", seller);
    if (!Array.isArray(initialProducts))
      console.error(
        "[DEBUG] BLOCKER — initialProducts is NOT an array:",
        initialProducts,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── FAB scroll ── */
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Load reviews ── */
  const loadReviews = useCallback(async () => {
    console.log("[DEBUG] Fetching rating for seller:", seller.id);
    try {
      const [ratingRes, reviewsRes] = await Promise.all([
        fetch(`${API}/api/reviews/seller/${seller.id}/rating`),
        fetch(`${API}/api/reviews/seller/${seller.id}?limit=20`),
      ]);

      console.log(
        "[DEBUG] ratingRes.status:",
        ratingRes.status,
        "ok:",
        ratingRes.ok,
      );

      if (ratingRes.ok) {
        const json = await ratingRes.json();
        console.log("[DEBUG] Raw response:", json);
        console.log(
          "[DEBUG] json.success:",
          json?.success,
          "json.data:",
          json?.data,
        );

        if (json?.success && json.data) {
          console.log("[DEBUG] Setting ratingSummary:", json.data);
          setRatingSummary(json.data);
        } else {
          console.warn(
            "[DEBUG] Condition failed — ratingSummary NOT set. success:",
            json?.success,
            "data:",
            json?.data,
          );
        }
      } else {
        console.error("[DEBUG] ratingRes NOT ok — status:", ratingRes.status);
      }

      if (reviewsRes.ok) {
        const d = await reviewsRes.json();
        setReviews(d.data || []);
      }
    } catch (err) {
      console.error("[DEBUG] Fetch failed:", err);
    }
  }, [seller.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  // Load editorial fonts (shared with collection page)
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

  useEffect(() => {
    if (!seller.is_live) return;

    trackEvent("live_store_view", {
      seller_id: seller.id,
      source: detectLiveSource(),
    });
  }, [seller.id, seller.is_live]);

  useEffect(() => {
    if (!seller.is_live) {
      setViewerCount(null);
      return;
    }

    let cancelled = false;

    const fetchViewerCount = async () => {
      try {
        const res = await fetch(`${API}/api/analytics/live-viewers/${seller.id}`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const json = await res.json().catch(() => null);
        const nextCount = Number(json?.data?.viewer_count);

        if (!cancelled) {
          setViewerCount(Number.isFinite(nextCount) ? nextCount : 0);
        }
      } catch (error) {
        console.error("live viewer count error", error);
      }
    };

    const sendHeartbeat = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      trackEvent("live_store_heartbeat", {
        seller_id: seller.id,
        source: "store_live",
      });
    };

    const initialTimeout = window.setTimeout(() => {
      void fetchViewerCount();
    }, 800);

    const countInterval = window.setInterval(() => {
      void fetchViewerCount();
    }, 15000);

    const heartbeatInterval = window.setInterval(() => {
      sendHeartbeat();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimeout);
      window.clearInterval(countInterval);
      window.clearInterval(heartbeatInterval);
    };
  }, [seller.id, seller.is_live]);

  useEffect(() => {
    setCurrentLiveProduct(seller.live_current_product ?? null);
  }, [seller.live_current_product]);

  useEffect(() => {
    if (!seller.is_live) return;

    let cancelled = false;

    const pollLiveCurrentProduct = async () => {
      try {
        const res = await fetch(`${API}/api/public/seller/${seller.id}`);
        if (!res.ok) return;

        const data = await res.json();
        const nextProduct = data?.seller?.live_current_product ?? null;

        if (cancelled) return;

        setCurrentLiveProduct((prev) => {
          const prevId = prev?.id ?? null;
          const nextId = nextProduct?.id ?? null;

          if (prevId === nextId) return prev;

          setIsCurrentLiveProductChanging(true);
          return nextProduct;
        });
      } catch (error) {
        console.error("live polling error", error);
      }
    };

    const interval = window.setInterval(pollLiveCurrentProduct, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [seller.id, seller.is_live]);

  useEffect(() => {
    if (!isCurrentLiveProductChanging) return;

    const timeout = window.setTimeout(() => {
      setIsCurrentLiveProductChanging(false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [isCurrentLiveProductChanging]);

  useEffect(() => {
    fetch(`${API}/api/collections/public/seller/${seller.id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.ok) setCollections(data.data ?? []); })
      .catch(() => {});
  }, [seller.id]);

  const featuredCollection = useMemo(() => {
    const liveCollectionId = Number(seller.live_collection_id ?? 0);
    if (!liveCollectionId) return null;
    return collections.find((collection) => collection.id === liveCollectionId) ?? null;
  }, [collections, seller.live_collection_id]);

  const storefrontCollections = useMemo(
    () => collections.filter((collection) => collection.id !== featuredCollection?.id),
    [collections, featuredCollection?.id],
  );

  /* ── Filtros + Sort ── */
  const productos = useMemo(() => {
    let list = [...initialProducts];
    list = list.filter((p) => {
      const precio = Number(p.precio);
      return precio >= precioMin && precio <= precioMax;
    });
    if (sort === "price_asc")
      list.sort((a, b) => Number(a.precio) - Number(b.precio));
    if (sort === "price_desc")
      list.sort((a, b) => Number(b.precio) - Number(a.precio));
    return list;
  }, [initialProducts, precioMin, precioMax, sort]);

  /* ── Destacados ── */
  const destacados = useMemo(
    () =>
      seller.productos_destacados?.length
        ? productos.filter((p) => seller.productos_destacados!.includes(p.id))
        : [],
    [productos, seller.productos_destacados],
  );

  /* ── Featured (most relevant if no destacados) ── */
  const featuredProduct = useMemo(
    () =>
      destacados.length === 0 && productos.length > 0 ? productos[0] : null,
    [destacados, productos],
  );

  const livePreviewProducts = useMemo(
    () => seller.live_featured_products ?? [],
    [seller.live_featured_products],
  );
  const mainProduct = useMemo(
    () => seller.live_featured_products?.[0] ?? null,
    [seller.live_featured_products],
  );
  const secondaryLiveProducts = useMemo(
    () =>
      livePreviewProducts.filter((product) =>
        mainProduct ? product.id !== mainProduct.id : true,
      ),
    [livePreviewProducts, mainProduct],
  );
  const liveExternalPreviewImage = useMemo(
    () =>
      seller.live_external_preview?.image_url ||
      mainProduct?.imagen_url ||
      livePreviewProducts[0]?.imagen_url ||
      null,
    [
      livePreviewProducts,
      mainProduct?.imagen_url,
      seller.live_external_preview?.image_url,
    ],
  );
  const liveExternalPreviewTitle = useMemo(
    () =>
      seller.live_external_preview?.title ||
      seller.live_external_preview?.site_name ||
      seller.nombre_comercio,
    [
      seller.live_external_preview?.site_name,
      seller.live_external_preview?.title,
      seller.nombre_comercio,
    ],
  );
  const liveExternalPreviewDescription = useMemo(
    () => seller.live_external_preview?.description ?? null,
    [seller.live_external_preview?.description],
  );
  const livePlatformLabel = useMemo(
    () => getLivePlatformLabel(seller.live_platform ?? null),
    [seller.live_platform],
  );
  const livePlatformTheme = useMemo(
    () => getLivePlatformTheme(seller.live_platform ?? null),
    [seller.live_platform],
  );
  const liveOverviewItems = useMemo(
    () =>
      [
        viewerCount !== null
          ? { label: "Viendo ahora", value: `${viewerCount}` }
          : null,
        livePlatformLabel
          ? { label: "Transmisión", value: livePlatformLabel }
          : null,
        livePreviewProducts.length > 0
          ? {
              label: "Piezas del live",
              value: `${livePreviewProducts.length}`,
            }
          : null,
      ].filter(Boolean) as Array<{ label: string; value: string }>,
    [viewerCount, livePlatformLabel, livePreviewProducts.length],
  );
  const LivePlatformIcon = useMemo(() => {
    if (seller.live_platform === "instagram") return Instagram;
    if (seller.live_platform === "facebook") return Facebook;
    return Music2;
  }, [seller.live_platform]);

  /* ── Member since ── */
  const memberSince = useMemo(
    () =>
      seller.created_at ? new Date(seller.created_at).getFullYear() : null,
    [seller.created_at],
  );

  /* ── WhatsApp ── */
  const phone = useMemo(
    () => extractWhatsAppPhone(seller.whatsapp ?? seller.whatsapp_numero) ?? "",
    [seller.whatsapp, seller.whatsapp_numero],
  );
  const showWhatsapp = !!phone;
  const sellerWhatsappLabel = seller.nombre_comercio
    ? tr("seller.talkWithName").replace("{name}", seller.nombre_comercio)
    : tr("seller.askWhatsapp");
  const sellerWhatsappMessage = useMemo(
    () =>
      tr("seller.whatsappMessageTemplate").replace(
        "{namePart}",
        seller.nombre_comercio ? " " + seller.nombre_comercio : "",
      ),
    [seller.nombre_comercio, tr],
  );
  const mainProductWhatsappMessage = useMemo(() => {
    if (!mainProduct) return sellerWhatsappMessage;

    const productLine = `Hola${
      seller.nombre_comercio ? ` ${seller.nombre_comercio}` : ""
    }, me interesa el producto destacado que estás mostrando en vivo: ${
      mainProduct.nombre
    }.`;
    const codeLine = mainProduct.sku
      ? `\nSKU: ${mainProduct.sku}`
      : mainProduct.internal_code
        ? `\nCódigo: ${mainProduct.internal_code}`
        : "";

    return `${productLine}${codeLine}`;
  }, [mainProduct, seller.nombre_comercio, sellerWhatsappMessage]);

  /* ── Header background ── */
  const headerBgStyle = useMemo(
    () =>
      buildHeaderStyle(
        seller.header_style ?? DEFAULT_HEADER_STYLE,
        seller.banner_url,
      ),
    [seller.banner_url, seller.header_style],
  );

  const handleWhatsappConfirm = useCallback(
    (message: string, productId?: string) => {
      fetch(`${API}/api/engagement/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: seller.id,
          product_id: productId ?? null,
          type: "click",
        }),
      }).catch(() => {});

      const href = buildWhatsAppHref(phone, message);
      if (!href) return;

      window.open(href, "_blank", "noopener,noreferrer");
    },
    [phone, seller.id],
  );

  const handleOpenWhatsApp = useCallback(
    (product?: LiveFeaturedProduct | null) => {
      if (product && mainProduct && product.id === mainProduct.id) {
        trackEvent("live_whatsapp_click", {
          seller_id: seller.id,
          product_id: mainProduct.id,
          source: "store_live",
        });
      }

      setWhatsAppProduct(product ?? null);
      setWhatsAppOpen(true);
    },
    [mainProduct, seller.id],
  );

  const scrollToElement = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleShareStore = useCallback(async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!shareUrl) return;

    const shareTitle = seller.nombre_comercio;
    const shareText = `Descubre la tienda de ${seller.nombre_comercio} en Flowjuyu.`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
      } catch {}
    }

    setQrOpen(true);
  }, [seller.nombre_comercio]);

  useEffect(() => {
    if (seller.is_live || typeof window === "undefined") return;

    const sections = [
      { key: "catalog" as const, element: catalogSectionRef.current },
      { key: "collections" as const, element: collectionsSectionRef.current },
      { key: "reviews" as const, element: reviewsSectionRef.current },
    ].filter(
      (entry): entry is {
        key: "catalog" | "collections" | "reviews";
        element: HTMLElement;
      } => Boolean(entry.element),
    );

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const match = sections.find((section) => section.element === visible.target);
        if (match) {
          setMobileDockSection(match.key);
        }
      },
      {
        rootMargin: "-20% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    );

    sections.forEach((section) => observer.observe(section.element));
    return () => observer.disconnect();
  }, [seller.is_live, collections.length, reviews.length, productos.length]);

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <>
      <ProductDiscoveryLayout
        hideHeader={true}
        title={seller.nombre_comercio}
        subtitle={seller.descripcion ?? undefined}
        total={productos.length}
        precioMin={precioMin}
        precioMax={precioMax}
        setPrecioMin={setPrecioMin}
        setPrecioMax={setPrecioMax}
        sort={sort}
        setSort={setSort}
        onReset={() => {
          setPrecioMin(0);
          setPrecioMax(2000);
          setSort("");
        }}
      >
        {/* ══════════════════════════════════════════════
          FLOATING WHATSAPP FAB
      ══════════════════════════════════════════════ */}
        {showWhatsapp && (
          <button
            onClick={() => setWhatsAppOpen(true)}
            aria-label={sellerWhatsappLabel}
            className={`fixed bottom-3 right-3 z-50 flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-4 font-semibold text-white shadow-[0_18px_40px_-18px_rgba(16,185,129,0.95)] transition-all duration-300 hover:bg-green-600 active:scale-95 sm:bottom-6 sm:right-6 sm:justify-start sm:px-5 sm:py-3.5 ${
              fabVisible
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-4 opacity-0"
            }`}
          >
            <MessageCircle className="h-5 w-5 shrink-0" />
            <span className="hidden sm:inline">{sellerWhatsappLabel}</span>
          </button>
        )}

        {!seller.is_live && (
          <div
            className="fixed bottom-3 left-3 right-[4.85rem] z-40 md:hidden"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
          >
            <FloatingActionDock
              className="mx-auto w-full"
              maxVisible={4}
              compact
              variant="buyer"
              actions={[
                {
                  key: "catalog",
                  label: "Catalogo",
                  icon: ArrowRight,
                  active: mobileDockSection === "catalog",
                  onClick: () => {
                    scrollToElement(catalogSectionRef.current);
                  },
                },
                {
                  key: "collections",
                  label: "Looks",
                  icon: BookOpen,
                  active: mobileDockSection === "collections",
                  onClick: () => scrollToElement(collectionsSectionRef.current),
                },
                {
                  key: "reviews",
                  label: "Resenas",
                  icon: Star,
                  active: mobileDockSection === "reviews",
                  onClick: () => scrollToElement(reviewsSectionRef.current),
                },
                {
                  key: "share",
                  label: "Compartir",
                  icon: Share2,
                  onClick: () => {
                    void handleShareStore();
                  },
                },
              ]}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════
          HERO
          Content drives height; background is absolute.
      ══════════════════════════════════════════════ */}
        <div className="relative -mx-6 mb-0 overflow-hidden rounded-b-[40px]">
          {/* Background — single computed CSS layer, no separate overlay divs */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-[background-image,background-color] duration-300"
            style={headerBgStyle}
          />

          {/* Content layer */}
          <div className="relative px-6 pt-16 pb-10 text-white md:px-10 md:py-14">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col items-start gap-6 sm:flex-row md:gap-10">
                <SellerLogo
                  src={seller.logo}
                  alt={seller.nombre_comercio}
                  size="lg"
                />

                <div className="min-w-0 flex-1">
                  {/* Badges */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {seller.estado_validacion === "aprobado" && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-3 py-0.5 text-[10px] font-bold text-white">
                        <ShieldCheck className="h-3 w-3" />{" "}
                        {tr("seller.verified")}
                      </span>
                    )}
                    {seller.plan === "founder" && seller.plan_activo && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-bold text-black">
                        <Star className="h-3 w-3" /> Founder
                      </span>
                    )}
                    <span className="rounded-full border border-white/20 bg-white/15 px-3 py-0.5 text-[10px] font-semibold text-white/80 backdrop-blur">
                      🧵 {tr("seller.handmadeBadge")}
                    </span>
                    {ratingSummary &&
                      (ratingSummary.total_reviews > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/30 bg-amber-400/20 px-3 py-0.5 text-[10px] font-bold text-amber-200">
                          <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                          {ratingSummary.rating.toFixed(1)} (
                          {ratingSummary.total_reviews})
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-0.5 text-[10px] text-white/40">
                          {tr("seller.noReviewsBadge")}
                        </span>
                      ))}
                  </div>

                  <h1 className="text-3xl leading-tight font-bold tracking-tight md:text-5xl">
                    {seller.nombre_comercio}
                  </h1>
                  <div className="mt-3 h-[3px] w-20 rounded-full bg-amber-400" />

                  {(seller.municipio || seller.departamento) && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm opacity-80">
                      <MapPin className="h-3.5 w-3.5" />
                      {[seller.municipio, seller.departamento]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}

                  {seller.mensaje_destacado && (
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base">
                      {seller.mensaje_destacado}
                    </p>
                  )}

                  <SocialButtons
                    links={{
                      instagram: seller.instagram,
                      facebook: seller.facebook,
                      tiktok: seller.tiktok,
                    }}
                    className="mt-4"
                    onLinkClick={(platform) => {
                      fetch(`${API}/api/engagement/social`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          seller_id: seller.id,
                          platform,
                          type: "click",
                        }),
                      }).catch(() => {});
                    }}
                  />

                  {/* Fast reply badge */}
                  {showWhatsapp && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                      {tr("seller.fastReplyBadge")}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-5 text-sm opacity-80">
                    <span>
                      🛍 {productos.length}{" "}
                      {productos.length === 1
                        ? tr("seller.productSingular")
                        : tr("seller.productPlural")}
                    </span>
                    {memberSince && (
                      <span>
                        📅 {tr("seller.memberSince")} {memberSince}
                      </span>
                    )}
                  </div>

                  {/* CTAs */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {showWhatsapp && (
                      <button
                        onClick={() => setWhatsAppOpen(true)}
                        className="inline-flex items-center gap-2.5 rounded-full bg-green-500 px-7 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-200 hover:bg-green-600 active:scale-95"
                      >
                        <MessageCircle className="h-4 w-4" />
                        💬 {sellerWhatsappLabel}
                      </button>
                    )}
                    <a
                      href="#catalogo"
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/25"
                    >
                      {tr("seller.viewCatalog")}{" "}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => setQrOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/25"
                    >
                      <Share2 className="h-4 w-4" />
                      {tr("seller.share")}
                    </button>

                    {/* Follow CTA */}
                    {!user ? (
                      <button
                        onClick={() => router.push("/login")}
                        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/25"
                      >
                        <UserPlus className="h-4 w-4" />
                        Seguir tienda
                      </button>
                    ) : user.role === "buyer" && Number(user.id) !== seller.id ? (
                      <FollowButton
                        sellerId={seller.id}
                        className="px-7 py-3 text-sm font-semibold"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Identity tags */}
              {seller.identidad_tags && seller.identidad_tags.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {seller.identidad_tags.slice(0, 5).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur-md transition hover:bg-white/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {seller.is_live &&
          (seller.live_message || livePreviewProducts.length > 0) && (
            <section className="mx-auto mt-8 max-w-6xl">
              <style>{`
                @keyframes live-vibrate-soft {
                  0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                  20% { transform: translate3d(-1px, 0, 0) rotate(-0.4deg); }
                  40% { transform: translate3d(1px, -1px, 0) rotate(0.35deg); }
                  60% { transform: translate3d(-1px, 1px, 0) rotate(-0.3deg); }
                  80% { transform: translate3d(1px, 0, 0) rotate(0.25deg); }
                }
              `}</style>
              <div className="overflow-hidden rounded-[28px] border border-[#b42318]/10 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                <div className="bg-gradient-to-r from-[#fff6f4] via-white to-[#fff9f7] px-5 py-5 md:px-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/60" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                        </span>
                        En vivo ahora
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
                          En vivo ahora
                        </h2>
                        {seller.live_message ? (
                          <p className="max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base">
                            {seller.live_message}
                          </p>
                        ) : (
                          <p className="max-w-3xl text-sm leading-relaxed text-neutral-600 md:text-base">
                            Esta tienda está mostrando productos en este momento.
                          </p>
                        )}
                        {liveOverviewItems.length > 0 ? (
                          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            {liveOverviewItems.map((item) => (
                              <div
                                key={item.label}
                                className="min-w-[132px] rounded-full border border-neutral-200 bg-white px-4 py-2.5 shadow-sm"
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                                  {item.label}
                                </p>
                                <p className="pt-1 text-sm font-semibold text-neutral-900">
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {seller.live_external_url ? (
                          <div className="pt-2">
                            <a
                              href={seller.live_external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                trackEvent("live_external_click", {
                                  seller_id: seller.id,
                                  platform: seller.live_platform ?? null,
                                  external_url: seller.live_external_url,
                                  source: "store_live",
                                });
                              }}
                              className="inline-flex w-full max-w-md items-center gap-3 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 pr-4 text-left text-sm font-semibold text-neutral-800 shadow-sm transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                            >
                              {liveExternalPreviewImage ? (
                                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3efe7]">
                                  <Image
                                    src={liveExternalPreviewImage}
                                    alt={seller.nombre_comercio}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div
                                  className={[
                                    "flex h-16 w-20 shrink-0 flex-col justify-between overflow-hidden rounded-xl border p-2",
                                    livePlatformTheme.surfaceClass,
                                  ].join(" ")}
                                >
                                  <span
                                    className={[
                                      "inline-flex w-fit rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]",
                                      livePlatformTheme.badgeClass,
                                    ].join(" ")}
                                  >
                                    {livePlatformLabel || "Live"}
                                  </span>
                                  <LivePlatformIcon
                                    className={[
                                      "h-4 w-4",
                                      livePlatformTheme.iconClass,
                                    ].join(" ")}
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b42318]">
                                  {livePlatformLabel
                                    ? `En vivo en ${livePlatformLabel}`
                                    : "Live externo"}
                                </p>
                                <p className="truncate text-sm font-medium text-neutral-900">
                                  {liveExternalPreviewTitle}
                                </p>
                                <p className="truncate text-xs text-neutral-500">
                                  {liveExternalPreviewDescription || "Abrir transmisión"}
                                </p>
                              </div>
                              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F3D3A]/6 text-[#0F3D3A]">
                                <LivePlatformIcon className="h-4 w-4" />
                              </div>
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/store/${publicStoreId}/live`}
                        className="inline-flex items-center gap-2 self-start rounded-full bg-[#0F3D3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0c312f]"
                      >
                        Entrar a la sala live
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <a
                        href="#catalogo"
                        className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                      >
                        Ver todos los productos
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>

                {secondaryLiveProducts.length > 0 && (
                  <div className="border-t border-neutral-100 px-5 py-5 md:px-7">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                          Piezas del live
                        </p>
                        <p className="text-sm text-neutral-600">
                          Otras piezas que están apareciendo en esta transmisión.
                        </p>
                      </div>
                    </div>
                    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {secondaryLiveProducts.map((product, index) => (
                        <Link
                          key={product.id}
                          href={
                            product.internal_code
                              ? `/p/${product.internal_code}`
                              : `/product/${product.id}`
                          }
                          className="group flex min-w-[240px] items-center gap-3 rounded-2xl border border-neutral-100 bg-[#fcfbf8] p-3 transition-all hover:-translate-y-0.5 hover:border-[#0F3D3A]/15 hover:shadow-md md:min-w-[280px]"
                          style={{
                            animation: "live-vibrate-soft 4.6s ease-in-out infinite",
                            animationDelay: `${index * 0.35}s`,
                          }}
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f3efe7]">
                            <Image
                              src={product.imagen_url || "/images/productos/default.jpg"}
                              alt={product.nombre}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                                {product.nombre}
                              </h3>
                              <p className="shrink-0 text-sm font-bold text-[#0F3D3A]">
                                Q{Number(product.precio).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
                              <span>
                                {product.sku
                                  ? `SKU ${product.sku}`
                                  : "Producto del live"}
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#0F3D3A]">
                                Ver
                                <ArrowRight className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

        {seller.is_live && mainProduct && (
          <section className="mx-auto mt-6 max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="grid gap-0 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <div className="relative aspect-[4/3] bg-[#f3efe7] md:aspect-auto md:min-h-[320px]">
                  <Image
                    src={mainProduct.imagen_url || "/images/productos/default.jpg"}
                    alt={mainProduct.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center px-5 py-6 md:px-8 md:py-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b42318]">
                        Producto destacado en vivo
                      </p>
                      <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-[2rem]">
                        {mainProduct.nombre}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        Mostrado en este momento
                      </p>
                    </div>

                    <p className="text-3xl font-bold tracking-tight text-[#0F3D3A]">
                      Q{Number(mainProduct.precio).toFixed(2)}
                    </p>

                    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                      <Link
                        href={
                          mainProduct.internal_code
                            ? `/p/${mainProduct.internal_code}`
                            : `/product/${mainProduct.id}`
                        }
                        onClick={() => {
                          trackEvent("live_product_click", {
                            seller_id: seller.id,
                            product_id: mainProduct.id,
                            source: "store_live",
                          });
                        }}
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0F3D3A] px-5 text-sm font-semibold text-white transition hover:bg-[#0c312f]"
                      >
                        Comprar ahora
                        <ArrowRight className="h-4 w-4" />
                      </Link>

                      {showWhatsapp ? (
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsApp(mainProduct)}
                          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════ */}
        <div className="-mx-6 mb-12 flex flex-wrap items-center justify-center gap-6 border-b border-neutral-100 bg-white px-6 py-5 text-sm text-neutral-500">
          <span className="flex items-center gap-2">
            <span className="font-bold text-emerald-600">✓</span>
            {tr("seller.trustAuthentic")}
          </span>
          <span className="hidden h-4 w-px bg-neutral-200 sm:block" />
          <span className="flex items-center gap-2">
            <span className="font-bold text-emerald-600">✓</span>
            {tr("seller.trustDirect")}
          </span>
          <span className="hidden h-4 w-px bg-neutral-200 sm:block" />
          <span className="flex items-center gap-2">
            <span className="font-bold text-emerald-600">✓</span>
            {tr("seller.trustHandmade")}
          </span>
        </div>

        {/* ══════════════════════════════════════════════
          ARTISAN STORY SECTION
      ══════════════════════════════════════════════ */}
        {
          (console.log(
            "[DEBUG] RENDER CHECK — show_story:",
            config.show_story,
            "| descripcion:",
            !!seller.descripcion,
          ),
          null)
        }
        {config.show_story && seller.descripcion && (
          <section className="mb-16">
            <div className="rounded-3xl border border-neutral-100 bg-white p-8 md:p-10" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div className="max-w-2xl">
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 10 }}>
                  {tr("seller.storyEyebrow")}
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.15, color: "#1c1a17", margin: "0 0 16px" }}>
                  {tr("seller.storyHeading")} {seller.nombre_comercio}
                </h2>
                <p className="leading-relaxed text-neutral-500" style={{ fontSize: 15 }}>
                  {seller.descripcion}
                </p>
                {showWhatsapp && (
                  <button
                    onClick={() => setWhatsAppOpen(true)}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                  >
                    {tr("seller.talkDirectly")}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </section>
        )}


        {/* ══════════════════════════════════════════════
          DESTACADOS
      ══════════════════════════════════════════════ */}
        {config.show_featured && destacados.length > 0 && (
          <section className="mb-20">
            <div className="mb-8">
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                {tr("seller.curatedEyebrow")}
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1c1a17", margin: 0 }}>
                {tr("seller.destacadosTitle")}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {destacados.map((p, index) => (
                <Link
                  key={p.id}
                  href={
                    p.internal_code
                      ? `/p/${p.internal_code}`
                      : `/product/${p.id}`
                  }
                >
                  <div
                    className={`group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all duration-500 hover:shadow-xl ${index === 0 ? "md:col-span-2" : ""}`}
                  >
                    <div
                      className={`relative bg-neutral-50 ${index === 0 ? "aspect-[16/9]" : "aspect-square"}`}
                    >
                      <Image
                        src={getProductImage(p)}
                        alt={p.nombre}
                        fill
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                          ⭐ {tr("seller.featuredBadge")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="mb-0.5 text-[10px] font-semibold tracking-wide text-neutral-400 uppercase">
                            {tr("seller.artisanFeaturedLabel")}
                          </p>
                          <h3 className="line-clamp-1 text-sm font-bold text-neutral-800 transition-colors group-hover:text-[#0F3D3A]">
                            {p.nombre}
                          </h3>
                        </div>
                        <p className="shrink-0 text-base font-black text-[#0F3D3A]">
                          Q{Number(p.precio).toFixed(2)}
                        </p>
                      </div>
                      {p.descripcion && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-neutral-500">
                          {p.descripcion}
                        </p>
                      )}
                      <ProductDetailsBlock
                        atributos={p.atributos}
                        variant="store"
                      />
                      <div className="flex justify-end">
                        <span className="hidden items-center gap-1 rounded-full border border-[#0F3D3A]/30 px-3 py-1.5 text-xs font-semibold text-[#0F3D3A] transition-colors group-hover:bg-[#0F3D3A] group-hover:text-white sm:flex">
                          {tr("seller.viewProduct")}{" "}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════
          COLLECTIONS SECTION
      ══════════════════════════════════════════════ */}
        {(featuredCollection || storefrontCollections.length > 0) && (
          <section ref={collectionsSectionRef} className="mt-20 space-y-10">
            {featuredCollection ? (
              <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-[linear-gradient(135deg,#FBF5EE_0%,#F3ECE2_46%,#E9DED1_100%)] shadow-[0_24px_60px_rgba(15,61,58,0.08)]">
                <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="min-h-[340px] overflow-hidden border-b border-neutral-100 lg:min-h-[460px] lg:border-b-0 lg:border-r">
                    <CollectionArtworkPreview
                      name={featuredCollection.name}
                      imageUrl={!(featuredCollection.items?.length) ? (featuredCollection.promo_image_url ?? featuredCollection.background_image_url ?? null) : null}
                      backgroundImageUrl={featuredCollection.background_image_url ?? undefined}
                      items={featuredCollection.items}
                      backgroundColor={featuredCollection.background_color}
                      backgroundStyle={featuredCollection.background_style}
                      canvasWidth={featuredCollection.canvas_width}
                      canvasHeight={featuredCollection.canvas_height}
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-6 p-8 lg:p-10">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-neutral-400">Coleccion destacada</p>
                      <h2 className="mt-3 text-3xl font-bold text-neutral-900">{featuredCollection.name}</h2>
                      <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">{featuredCollection.description || `Una seleccion curada de ${seller.nombre_comercio} para descubrir piezas que conviven como conjunto dentro de la tienda.`}</p>
                      <p className="mt-4 text-sm font-medium text-neutral-500">{featuredCollection.product_count ?? featuredCollection.item_count ?? featuredCollection.products?.length ?? 0} productos enlazados</p>
                    </div>
                    {(featuredCollection.products ?? []).length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {(featuredCollection.products ?? []).slice(0, 4).map((product) => (
                          <div key={product.id} className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-3 backdrop-blur">
                            <div className="h-14 w-14 overflow-hidden rounded-xl bg-white">
                              {product.imagen_url ? (
                                <img src={product.imagen_url} alt={product.nombre} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-neutral-300">•</div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-neutral-800">{product.nombre}</p>
                              {product.precio != null ? <p className="text-xs text-neutral-500">Q{Number(product.precio).toFixed(2)}</p> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {storefrontCollections.length > 0 ? (
              <div>
                <div className="mb-8">
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                    Looks y conjuntos
                  </p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1c1a17", margin: 0 }}>
                    Colecciones de {seller.nombre_comercio}
                  </h2>
                </div>

                <style>{`
                  @keyframes coll-fadeIn   { from { opacity: 0; } to { opacity: 1; } }
                  @keyframes coll-slideUp  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                  @keyframes coll-slideLeft{ from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                  @keyframes coll-zoomIn   { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
                  @keyframes coll-float    { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-10px)} }
                  @keyframes coll-pulse    { 0%,100%{transform:scale(1)}        50%{transform:scale(1.06)} }
                  @keyframes coll-spin     { from{transform:rotate(0deg)}       to{transform:rotate(360deg)} }
                  @keyframes coll-shake    { 0%,100%{transform:translateX(0)}   25%,75%{transform:translateX(-5px)} 50%{transform:translateX(5px)} }
                  @keyframes coll-bounce   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
                `}</style>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {storefrontCollections.map((col) => {
                    const linkedProducts = (col.products ?? []).slice(0, 4);
                    const totalProducts = col.product_count ?? col.item_count ?? col.products?.length ?? col.items.length;
                    const collectionHref = col.public_id ? `/c/${col.public_id}` : null;

                    return (
                      <article
                        key={col.id}
                        className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                      >
                        {/* Preview image — no text overlay so the canvas artwork shows cleanly */}
                        {collectionHref ? (
                          <a href={collectionHref} className="block">
                            <CollectionPreviewBox
                              name={col.name}
                              imageUrl={!(col.items?.length) ? (col.promo_image_url ?? col.background_image_url ?? null) : null}
                              backgroundImageUrl={col.background_image_url ?? undefined}
                              items={col.items}
                              backgroundColor={col.background_color}
                              backgroundStyle={col.background_style}
                              canvasWidth={col.canvas_width}
                              canvasHeight={col.canvas_height}
                              maxWidth={480}
                              maxHeight={480}
                              className="w-full"
                            />
                          </a>
                        ) : (
                          <CollectionPreviewBox
                            name={col.name}
                            imageUrl={!(col.items?.length) ? (col.promo_image_url ?? col.background_image_url ?? null) : null}
                            backgroundImageUrl={col.background_image_url ?? undefined}
                            items={col.items}
                            backgroundColor={col.background_color}
                            backgroundStyle={col.background_style}
                            canvasWidth={col.canvas_width}
                            canvasHeight={col.canvas_height}
                            maxWidth={480}
                            maxHeight={480}
                            className="w-full"
                          />
                        )}

                        <div className="space-y-4 p-5">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">Colección</p>
                            <h3 className="mt-0.5 text-base font-semibold text-neutral-900">{col.name}</h3>
                            <p className="mt-0.5 text-xs text-neutral-400">{totalProducts} {totalProducts === 1 ? "pieza" : "piezas"}</p>
                          </div>

                          {col.description ? (
                            <p className="line-clamp-2 text-sm leading-6 text-neutral-500">{col.description}</p>
                          ) : null}

                          {linkedProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {linkedProducts.map((product) => (
                                <div key={product.id} className="flex items-center gap-2.5 rounded-xl border border-neutral-100 bg-neutral-50 p-2">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                                    {product.imagen_url ? (
                                      <img src={product.imagen_url} alt={product.nombre} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-neutral-300 text-xs">•</div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-medium text-neutral-800">{product.nombre}</p>
                                    {product.precio != null ? (
                                      <p className="text-[11px] text-neutral-500">Q{Number(product.precio).toFixed(2)}</p>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {collectionHref ? (
                            <a
                              href={collectionHref}
                              className="flex w-full items-center justify-center rounded-xl border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                            >
                              Ver colección completa →
                            </a>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* ══════════════════════════════════════════════
          PRODUCT GRID
      ══════════════════════════════════════════════ */}
        <section id="catalogo" ref={catalogSectionRef} className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                {tr("seller.catalogEyebrow")}
              </p>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1c1a17", margin: 0 }}>
                {tr("seller.catalogTitle")}
              </h2>
            </div>
            {productos.length > 0 && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.16em", color: "#9ca3af" }}>
                {productos.length} {productos.length === 1 ? tr("seller.productSingular") : tr("seller.productPlural")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {productos.map((p) => (
              <ProductCardV2
                key={p.id}
                product={{
                  ...p,
                  id: String(p.id),
                  precio: Number(p.precio),
                }}
                variant="default"
                href={p.internal_code ? `/p/${p.internal_code}` : undefined}
                imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ))}
            {productos.length === 0 && (
              <div className="col-span-full space-y-3 py-20 text-center">
                <p className="text-3xl opacity-40">🛍</p>
                <p className="font-medium text-neutral-500">
                  {tr("seller.noProducts")}
                </p>
              </div>
            )}
          </div>

          {/* Bottom WhatsApp strip */}
          {showWhatsapp && (
            <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-8 text-white sm:flex-row">
              <div>
                <p className="text-lg font-bold">
                  {tr("seller.questionTitle")}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {tr("seller.talkWith")} {seller.nombre_comercio}
                </p>
              </div>
              <button
                onClick={() => setWhatsAppOpen(true)}
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-green-500 px-8 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-green-600 active:scale-95"
              >
                <MessageCircle className="h-5 w-5" />
                {sellerWhatsappLabel}
              </button>
            </div>
          )}

          {seller.is_live && currentLiveProduct ? (
            <div className="h-28 md:h-32" aria-hidden="true" />
          ) : null}
        </section>

        {/* ══════════════════════════════════════════════
          REVIEWS SECTION
      ══════════════════════════════════════════════ */}
        {
          (console.log(
            "[DEBUG] RENDER CHECK — show_reviews:",
            config.show_reviews,
            "| ratingSummary:",
            ratingSummary,
            "| reviews.length:",
            reviews.length,
          ),
          null)
        }
        {config.show_reviews && (
          <section ref={reviewsSectionRef} className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.30em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                  {tr("seller.reviewsEyebrow")}
                </p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 500, fontStyle: "italic", letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1c1a17", margin: 0 }}>
                  {tr("seller.reviewsTitle")}
                </h2>
              </div>

              {/* Rating summary */}
              {ratingSummary &&
                (ratingSummary.total_reviews > 0 ? (
                  <div className="text-right">
                    <div className="text-3xl font-black text-neutral-900">
                      {ratingSummary.rating.toFixed(1)}
                    </div>
                    <Stars
                      rating={Math.round(ratingSummary.rating)}
                      size="sm"
                    />
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {ratingSummary.total_reviews}{" "}
                      {ratingSummary.total_reviews === 1
                        ? tr("seller.reviewSingular")
                        : tr("seller.reviewPlural")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400 italic">
                    {tr("seller.noRatingYet")}
                  </p>
                ))}
            </div>

            {/* Review list */}
            {reviews.length > 0 ? (
              <div className="mb-8 space-y-4">
                {(showAllReviews ? reviews : reviews.slice(0, 4)).map((r) => {
                  const buyerName =
                    typeof r.buyer_name === "string" && r.buyer_name.trim()
                      ? r.buyer_name.trim()
                      : "Comprador";

                  return (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white">
                            {buyerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-800">
                              {buyerName}
                            </p>
                            <Stars rating={r.rating} />
                          </div>
                        </div>
                        <p className="flex-shrink-0 text-xs text-neutral-400">
                          {new Date(r.created_at).toLocaleDateString("es-GT", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      {r.comment && (
                        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                          {r.comment}
                        </p>
                      )}
                      {r.product_nombre && (
                        <p className="mt-2 text-xs text-neutral-400">
                          {tr("seller.reviewAbout")}{" "}
                          <span className="text-neutral-600">
                            {r.product_nombre}
                          </span>
                        </p>
                      )}
                    </div>
                  );
                })}

                {reviews.length > 4 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full rounded-xl border border-[#0F3D3A]/30 py-3 text-sm font-semibold text-[#0F3D3A] transition hover:bg-[#0F3D3A]/5"
                  >
                    {showAllReviews
                      ? tr("seller.showLess")
                      : `${tr("seller.showAllReviews")} (${reviews.length})`}
                  </button>
                )}
              </div>
            ) : (
              <div className="mb-8 py-10 text-center text-sm text-neutral-400">
                {tr("seller.noReviewsYet")}
              </div>
            )}

            {/* Review form */}
            <ReviewForm sellerId={seller.id} onSubmitted={loadReviews} />
          </section>
        )}
      </ProductDiscoveryLayout>

      {seller.is_live && currentLiveProduct ? (
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur transition-opacity duration-300 ${
            isCurrentLiveProductChanging ? "opacity-80" : "opacity-100"
          }`}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f3efe7] sm:h-16 sm:w-16">
              <Image
                src={
                  currentLiveProduct.imagen_url || "/images/productos/default.jpg"
                }
                alt={currentLiveProduct.nombre}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b42318]">
                Producto en vivo
              </p>
              <p className="truncate text-sm font-semibold text-neutral-900 sm:text-base">
                {currentLiveProduct.nombre}
              </p>
              <p className="text-sm font-bold text-[#0F3D3A]">
                Q{Number(currentLiveProduct.precio).toFixed(2)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={
                  currentLiveProduct.internal_code
                    ? `/p/${currentLiveProduct.internal_code}`
                    : `/product/${currentLiveProduct.id}`
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0F3D3A] px-4 text-sm font-semibold text-white transition hover:bg-[#0c312f]"
              >
                Ver
              </Link>

              {showWhatsapp ? (
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp(currentLiveProduct)}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-neutral-200 px-4 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                >
                  WhatsApp
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showWhatsapp && (
        <WhatsAppModal
          open={whatsAppOpen}
          onClose={() => {
            setWhatsAppOpen(false);
            setWhatsAppProduct(null);
          }}
          onConfirm={(message) => {
            setWhatsAppOpen(false);
            handleWhatsappConfirm(message, whatsAppProduct?.id);
            setWhatsAppProduct(null);
          }}
          product={
            whatsAppProduct
              ? {
                  nombre: whatsAppProduct.nombre,
                  precio: Number(whatsAppProduct.precio),
                  imagen: whatsAppProduct.imagen_url ?? null,
                }
              : undefined
          }
          seller={{
            nombre: seller.nombre_comercio,
            imagen: seller.logo ?? null,
          }}
          initialMessage={
            whatsAppProduct ? mainProductWhatsappMessage : sellerWhatsappMessage
          }
          copy={{
            ariaLabel: tr("seller.whatsappModalAriaLabel"),
            title: tr("seller.whatsappModalTitle"),
            subtitle: tr("seller.whatsappModalSubtitle"),
            notice: LEGAL_WHATSAPP_NOTICE,
            messageLabel: tr("seller.whatsappModalMessageLabel"),
            hint: tr("seller.whatsappModalHint"),
            confirm: tr("seller.whatsappModalConfirm"),
            cancel: tr("seller.whatsappModalCancel"),
            footer: tr("seller.whatsappModalFooter"),
          }}
        />
      )}

      <SellerQrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        sellerId={publicStoreId}
        nombreComercio={seller.nombre_comercio}
      />
    </>
  );
}

