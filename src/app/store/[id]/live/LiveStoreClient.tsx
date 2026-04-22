"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  Store,
} from "lucide-react";

import PublicLiveChat from "@/components/live/PublicLiveChat";
import WhatsAppModal from "@/components/product/WhatsAppModal";
import { SellerLogo } from "@/components/seller/SellerLogo";
import { trackEvent } from "@/lib/analytics";
import { getLivePlatformLabel, getLivePlatformTheme } from "@/lib/liveExternal";
import { LEGAL_WHATSAPP_NOTICE } from "@/lib/legal";
import type { PhoneNumber } from "@/lib/phone";
import { buildWhatsAppHref, extractWhatsAppPhone } from "@/lib/whatsapp";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

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
  nombre_comercio: string;
  descripcion?: string | null;
  logo?: string | null;
  banner_url?: string | null;
  municipio?: string | null;
  departamento?: string | null;
  whatsapp?: string | null;
  whatsapp_numero?: PhoneNumber | null;
  is_live?: boolean;
  live_message?: string | null;
  live_external_url?: string | null;
  live_platform?: "tiktok" | "instagram" | "facebook" | null;
  live_external_preview?: {
    title?: string | null;
    description?: string | null;
    image_url?: string | null;
  } | null;
  live_featured_products?: LiveFeaturedProduct[];
};

type Product = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
  internal_code?: string | null;
};

type Props = {
  seller: Seller;
  initialProducts: Product[];
};

const QUICK_QUESTIONS = [
  "¿Sigue disponible esta pieza?",
  "¿Qué colores tienes ahorita?",
  "¿Me compartes medidas y precio final?",
  "¿Puedes apartarla para hoy?",
];

export default function LiveStoreClient({ seller, initialProducts }: Props) {
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [whatsAppProduct, setWhatsAppProduct] =
    useState<LiveFeaturedProduct | null>(null);
  const [customMessage, setCustomMessage] = useState<string | null>(null);

  const phone = useMemo(
    () => extractWhatsAppPhone(seller.whatsapp ?? seller.whatsapp_numero) ?? "",
    [seller.whatsapp, seller.whatsapp_numero],
  );
  const showWhatsapp = Boolean(phone);
  const liveProducts = useMemo(
    () => seller.live_featured_products ?? [],
    [seller.live_featured_products],
  );
  const mainProduct = useMemo(
    () => liveProducts[0] ?? null,
    [liveProducts],
  );
  const secondaryProducts = useMemo(
    () =>
      liveProducts.filter((product) =>
        mainProduct ? product.id !== mainProduct.id : true,
      ),
    [liveProducts, mainProduct],
  );
  const sellerWhatsappMessage = useMemo(
    () =>
      `Hola${seller.nombre_comercio ? ` ${seller.nombre_comercio}` : ""}, vi tu sala en vivo en Flowjuyu y quiero más información.`,
    [seller.nombre_comercio],
  );
  const productWhatsappMessage = useMemo(() => {
    if (!whatsAppProduct) return sellerWhatsappMessage;
    const codeLine = whatsAppProduct.sku
      ? `\nSKU: ${whatsAppProduct.sku}`
      : whatsAppProduct.internal_code
        ? `\nCódigo: ${whatsAppProduct.internal_code}`
        : "";

    return `Hola${seller.nombre_comercio ? ` ${seller.nombre_comercio}` : ""}, me interesa la pieza que estás mostrando en vivo: ${whatsAppProduct.nombre}.${codeLine}`;
  }, [seller.nombre_comercio, sellerWhatsappMessage, whatsAppProduct]);
  const livePlatformLabel = useMemo(
    () => getLivePlatformLabel(seller.live_platform ?? null),
    [seller.live_platform],
  );
  const livePlatformTheme = useMemo(
    () => getLivePlatformTheme(seller.live_platform ?? null),
    [seller.live_platform],
  );
  const LivePlatformIcon = useMemo(() => {
    if (seller.live_platform === "instagram") return Instagram;
    if (seller.live_platform === "facebook") return Facebook;
    return Music2;
  }, [seller.live_platform]);
  const externalPreviewImage = useMemo(
    () =>
      seller.live_external_preview?.image_url ||
      mainProduct?.imagen_url ||
      seller.banner_url ||
      null,
    [
      mainProduct?.imagen_url,
      seller.banner_url,
      seller.live_external_preview?.image_url,
    ],
  );
  const liveProductsWithFallback = useMemo(() => {
    if (liveProducts.length > 0) return liveProducts;
    return initialProducts.slice(0, 6);
  }, [initialProducts, liveProducts]);

  useEffect(() => {
    if (!seller.is_live) return;

    trackEvent("live_store_view", {
      seller_id: seller.id,
      source: "direct",
    });
  }, [seller.id, seller.is_live]);

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

  const openWhatsApp = useCallback(
    (product?: LiveFeaturedProduct | null, question?: string) => {
      if (product) {
        trackEvent("live_whatsapp_click", {
          seller_id: seller.id,
          product_id: product.id,
          source: "store_live",
        });
      }

      setWhatsAppProduct(product ?? null);
      setCustomMessage(question ?? null);
      setWhatsAppOpen(true);
    },
    [seller.id],
  );

  if (!seller.is_live) {
    return (
      <main className="min-h-screen bg-[#f6f1e8] px-4 py-12 text-neutral-900 md:px-8">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Live no disponible
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Esta sala en vivo no está activa ahora
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
            Puedes volver a la tienda pública para seguir explorando el catálogo
            completo del vendedor.
          </p>
          <Link
            href={`/store/${seller.id}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0F3D3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c312f]"
          >
            Volver a la tienda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-[#f6f1e8] px-4 py-6 text-neutral-900 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-[#0F3D3A]/10 bg-[linear-gradient(135deg,_#133a33_0%,_#0f2d28_52%,_#0b201d_100%)] text-white shadow-[0_22px_60px_rgba(15,23,42,0.18)]">
            <div className="grid gap-6 px-5 py-6 md:grid-cols-[minmax(0,1fr)_320px] md:px-8 md:py-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-300/70" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                    </span>
                    Sala live
                  </span>
                  <Link
                    href={`/store/${seller.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 transition hover:bg-white/15"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Volver a la tienda
                  </Link>
                </div>

                <div className="flex items-start gap-4">
                  <SellerLogo
                    src={seller.logo}
                    alt={seller.nombre_comercio}
                    size="md"
                  />
                  <div className="min-w-0 space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                      {seller.nombre_comercio}
                    </h1>
                    <p className="max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
                      {seller.live_message ||
                        "Esta tienda está mostrando piezas en tiempo real para que puedas comprarlas con menos fricción."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-white/70">
                      {seller.municipio || seller.departamento ? (
                        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1">
                          {[seller.municipio, seller.departamento]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1">
                        {liveProductsWithFallback.length} piezas activas
                      </span>
                      {livePlatformLabel ? (
                        <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1">
                          En vivo en {livePlatformLabel}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {mainProduct ? (
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
                      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-[#0F3D3A] transition hover:bg-[#f5efe7]"
                    >
                      Ver pieza principal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                  <Link
                    href={`/store/${seller.id}#catalogo`}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Ver todo el catálogo
                    <Store className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {seller.live_external_url ? (
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
                  className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/8 p-3 shadow-sm backdrop-blur"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/10">
                    {externalPreviewImage ? (
                      <Image
                        src={externalPreviewImage}
                        alt={seller.nombre_comercio}
                        fill
                        sizes="320px"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-3 px-1 pt-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                          livePlatformTheme.badgeClass,
                        ].join(" ")}
                      >
                        <LivePlatformIcon
                          className={[
                            "h-3.5 w-3.5",
                            livePlatformTheme.iconClass,
                          ].join(" ")}
                        />
                        {livePlatformLabel || "Live externo"}
                      </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-white">
                        {seller.live_external_preview?.title ||
                          `Abrir live en ${livePlatformLabel || "tu plataforma"}`}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white/70">
                        {seller.live_external_preview?.description ||
                          "Entra directamente a la transmisión social mientras exploras las piezas destacadas."}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                      Ver transmisión
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </a>
              ) : (
                <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 text-white/75 backdrop-blur">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    Sala Flowjuyu
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">
                    Piezas disponibles en esta exhibición
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed">
                    Aquí puedes ver rápido lo que el taller está mostrando y
                    saltar directo a la pieza que te interesa.
                  </p>
                </div>
              )}
            </div>
          </section>

          {mainProduct ? (
            <section className="overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="relative aspect-[4/3] bg-[#efe7dc] md:aspect-auto md:min-h-[420px]">
                  <Image
                    src={mainProduct.imagen_url || "/images/productos/default.jpg"}
                    alt={mainProduct.nombre}
                    fill
                    sizes="(max-width: 768px) 100vw, 55vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center px-5 py-6 md:px-8 md:py-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b42318]">
                    Pieza principal en vivo
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 md:text-[2.4rem]">
                    {mainProduct.nombre}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                    La pieza protagonista de esta sala. Si quieres verla con más
                    detalle o apartarla ahora mismo, este es el punto más rápido.
                  </p>
                  <p className="mt-5 text-3xl font-bold tracking-tight text-[#0F3D3A]">
                    Q{Number(mainProduct.precio).toFixed(2)}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                        onClick={() => openWhatsApp(mainProduct)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Preguntar por WhatsApp
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
              <div className="flex flex-col gap-4 border-b border-neutral-100 pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Piezas en exhibición
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
                    Todo lo que está apareciendo en el live
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                    Aquí ya puedes entrar directo a cada pieza, sin perderte en
                    el resto de la tienda.
                  </p>
                </div>
                <Link
                  href={`/store/${seller.id}#catalogo`}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:border-[#0F3D3A]/20 hover:text-[#0F3D3A]"
                >
                  Ver catálogo completo
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {liveProductsWithFallback.map((product) => (
                  <Link
                    key={product.id}
                    href={
                      product.internal_code
                        ? `/p/${product.internal_code}`
                        : `/product/${product.id}`
                    }
                    onClick={() => {
                      trackEvent("live_product_click", {
                        seller_id: seller.id,
                        product_id: product.id,
                        source: "store_live",
                      });
                    }}
                    className="group overflow-hidden rounded-2xl border border-neutral-100 bg-[#fcfbf8] transition-all hover:-translate-y-0.5 hover:border-[#0F3D3A]/15 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] bg-[#efe7dc]">
                      <Image
                        src={product.imagen_url || "/images/productos/default.jpg"}
                        alt={product.nombre}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="space-y-2 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm font-semibold text-neutral-900">
                          {product.nombre}
                        </h3>
                        <p className="shrink-0 text-sm font-bold text-[#0F3D3A]">
                          Q{Number(product.precio).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                          {"sku" in product && product.sku
                            ? `SKU ${product.sku}`
                            : "Pieza del live"}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-[#0F3D3A]">
                          Abrir pieza
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="space-y-5">
              <PublicLiveChat
                sellerId={seller.id}
                quickQuestions={QUICK_QUESTIONS}
                onFallbackQuestion={(question) =>
                  openWhatsApp(mainProduct, question)
                }
              />

              {secondaryProducts.length > 0 ? (
                <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Más piezas
                  </p>
                  <div className="mt-4 space-y-3">
                    {secondaryProducts.slice(0, 3).map((product) => (
                      <Link
                        key={product.id}
                        href={
                          product.internal_code
                            ? `/p/${product.internal_code}`
                            : `/product/${product.id}`
                        }
                        className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-[#fcfbf8] p-3 transition hover:border-[#0F3D3A]/15 hover:shadow-sm"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#efe7dc]">
                          <Image
                            src={product.imagen_url || "/images/productos/default.jpg"}
                            alt={product.nombre}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
                            {product.nombre}
                          </p>
                          <p className="mt-1 text-sm font-bold text-[#0F3D3A]">
                            Q{Number(product.precio).toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </section>
        </div>
      </main>

      {showWhatsapp ? (
        <WhatsAppModal
          open={whatsAppOpen}
          onClose={() => {
            setWhatsAppOpen(false);
            setWhatsAppProduct(null);
            setCustomMessage(null);
          }}
          onConfirm={(message) => {
            setWhatsAppOpen(false);
            handleWhatsappConfirm(message, whatsAppProduct?.id);
            setWhatsAppProduct(null);
            setCustomMessage(null);
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
          initialMessage={customMessage || productWhatsappMessage}
          copy={{
            ariaLabel: "Abrir conversación por WhatsApp",
            title: "Hablar con el taller",
            subtitle: "Usa este mensaje como punto de partida y ajusta lo que necesites antes de salir a WhatsApp.",
            notice: LEGAL_WHATSAPP_NOTICE,
            messageLabel: "Mensaje",
            hint: "Puedes pedir disponibilidad, colores, medidas o reservar la pieza.",
            confirm: "Continuar en WhatsApp",
            cancel: "Cerrar",
            footer: "Te llevaremos a WhatsApp en una nueva pestaña.",
          }}
        />
      ) : null}
    </>
  );
}
