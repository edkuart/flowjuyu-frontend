"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, MessageCircle, Package, Star, TrendingUp } from "lucide-react";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { BaseSection } from "@/components/ui/BaseSection";
import { apiFetch } from "@/lib/api";
import { apiGetVendedorPerfil } from "@/services/vendedorPerfil";
import { fetchSellerAnalytics } from "@/services/sellerAnalytics";
import { fetchSellerDashboard } from "@/services/sellerDashboard";
import { interpretMetric } from "@/lib/metricInterpreter";
import {
  getSellerPerformanceSummary,
  type NextAction,
} from "@/lib/sellerPerformance";
import type { SellerPerfil } from "@/lib/sellerProgress";
import {
  getSellerOnboardingSummary,
  isSellerOnboardingComplete,
  type SellerOnboardingState,
} from "@/lib/sellerOnboarding";
import {
  DashboardStatCard,
  SellerMetricsKpiIntro,
  SellerMetricsExecutiveHeader,
  SellerMetricsOnboardingBanner,
  SellerTopSignalPanel,
  SellerAlertsStrip,
} from "@/components/seller/metrics/SellerMetricsShared";
import { SellerMetricsTabs } from "@/components/seller/metrics/SellerMetricsTabs";
import { SellerMetricsSummarySection } from "@/components/seller/metrics/SellerMetricsSummarySection";
import { SellerMetricsTrafficSection } from "@/components/seller/metrics/SellerMetricsTrafficSection";
import { SellerMetricsProductsSection } from "@/components/seller/metrics/SellerMetricsProductsSection";
import { SellerMetricsReputationSection } from "@/components/seller/metrics/SellerMetricsReputationSection";
import { SellerMetricsOpportunitiesSection } from "@/components/seller/metrics/SellerMetricsOpportunitiesSection";
import { SellerMetricsAdvancedSection } from "@/components/seller/metrics/SellerMetricsAdvancedSection";
import type {
  Analytics,
  PriorityInsight,
  ReviewInsights,
  SellerMetricsTabId,
} from "@/components/seller/metrics/types";

export default function SellerMetricsPage() {
  const [activeTab, setActiveTab] = useState<SellerMetricsTabId>("summary");
  const [loading, setLoading] = useState(true);
  const [sellerProducts, setSellerProducts] = useState<
    Array<{
      activo?: boolean;
      descripcion?: string;
      imagenes?: Array<{ url?: string | null }>;
      imagen_url?: string | null;
    }>
  >([]);
  const [sellerProfile, setSellerProfile] = useState<SellerPerfil | null>(null);
  const [sellerValidation, setSellerValidation] = useState<
    "pendiente" | "en_revision" | "aprobado" | "rechazado" | null
  >(null);
  const [catalogo, setCatalogo] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    totalProductViews: 0,
    totalProfileViews: 0,
    totalIntentions: 0,
    conversionRatio: 0,
    topProducts: [],
    topIntentedProducts: [],
    last30Days: [],
    totalWhatsappClicks: 0,
    last30WhatsappClicks: 0,
    totalReviews: 0,
    avgRating: null,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [reviewInsights, setReviewInsights] = useState<ReviewInsights>({
    rating_avg: 0,
    rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    total_reviews: 0,
    recent_reviews_count: 0,
    low_rating_count: 0,
    top_products_by_reviews: [],
    frequent_terms: [],
  });
  const [onboardingState, setOnboardingState] =
    useState<SellerOnboardingState | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const onboardingRes = await apiFetch("/api/seller/onboarding/status");
        if (onboardingRes.ok) {
          const onboardingData = await onboardingRes.json();
          setOnboardingState(onboardingData.onboarding_state ?? null);
        }

        const dash = await fetchSellerDashboard();
        const analyticsData = await fetchSellerAnalytics();
        const [profileRes, productsRes] = await Promise.all([
          apiGetVendedorPerfil().catch(() => null),
          apiFetch("/api/seller/products")
            .then(async (res) => {
              if (!res.ok) return [];
              const data = await res.json().catch(() => []);
              return Array.isArray(data) ? data : data.data || [];
            })
            .catch(() => []),
        ]);

        if (profileRes?.ok && profileRes.perfil) {
          setSellerProfile(profileRes.perfil);
          setSellerValidation(
            (profileRes.perfil.estado_validacion as
              | "pendiente"
              | "en_revision"
              | "aprobado"
              | "rechazado"
              | null) ?? null,
          );
        }
        setSellerProducts(productsRes);

        setCatalogo({
          total: dash.productoStats?.total ?? 0,
          activos: dash.productoStats?.activos ?? 0,
          inactivos: dash.productoStats?.inactivos ?? 0,
        });

        setAnalytics({
          totalProductViews: analyticsData.totalProductViews ?? 0,
          totalProfileViews: analyticsData.totalProfileViews ?? 0,
          totalIntentions: analyticsData.totalIntentions ?? 0,
          conversionRatio: analyticsData.conversionRatio ?? 0,
          topProducts: analyticsData.topProducts ?? [],
          topIntentedProducts: analyticsData.topIntentedProducts ?? [],
          last30Days: analyticsData.last30Days ?? [],
          totalWhatsappClicks: analyticsData.totalWhatsappClicks ?? 0,
          last30WhatsappClicks: analyticsData.last30WhatsappClicks ?? 0,
          totalReviews: analyticsData.totalReviews ?? 0,
          avgRating: analyticsData.avgRating ?? null,
        });

        const reviewRes = await apiFetch("/api/seller/reviews/insights");
        if (reviewRes.ok) {
          const reviewJson = await reviewRes.json();
          setReviewInsights({
            rating_avg: reviewJson.rating_avg ?? 0,
            rating_distribution: reviewJson.rating_distribution ?? {
              "1": 0,
              "2": 0,
              "3": 0,
              "4": 0,
              "5": 0,
            },
            total_reviews: reviewJson.total_reviews ?? 0,
            recent_reviews_count: reviewJson.recent_reviews_count ?? 0,
            low_rating_count: reviewJson.low_rating_count ?? 0,
            top_products_by_reviews: reviewJson.top_products_by_reviews ?? [],
            frequent_terms: reviewJson.frequent_terms ?? [],
          });
        }
      } catch (error) {
        console.error("Error cargando metricas seller:", error);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const conversionPercent = useMemo(() => {
    if (!analytics.totalProductViews) return 0;
    return Number((analytics.conversionRatio * 100).toFixed(2));
  }, [analytics.totalProductViews, analytics.conversionRatio]);

  const totalTrend = useMemo(() => {
    if (!analytics.last30Days.length) return 0;
    return analytics.last30Days.reduce(
      (acc, day) => acc + (day.product_views ?? 0) + (day.profile_views ?? 0),
      0,
    );
  }, [analytics.last30Days]);

  const { growthPercent, bestDay } = useMemo(() => {
    if (!analytics.last30Days.length) {
      return { growthPercent: 0, bestDay: null as string | null };
    }

    const last7 = analytics.last30Days.slice(-7);
    const prev7 = analytics.last30Days.slice(-14, -7);
    const sumWindow = (rows: typeof last7) =>
      rows.reduce(
        (acc, day) => acc + (day.product_views ?? 0) + (day.profile_views ?? 0),
        0,
      );

    const totalLast7 = sumWindow(last7);
    const totalPrev7 = sumWindow(prev7);

    let growth = 0;
    if (totalPrev7 > 0) {
      growth = Math.round(((totalLast7 - totalPrev7) / totalPrev7) * 100);
    } else if (totalLast7 > 0) {
      growth = 100;
    }

    const best =
      last7.length > 0
        ? [...last7].sort(
            (a, b) =>
              b.product_views +
              b.profile_views -
              (a.product_views + a.profile_views),
          )[0]
        : null;

    return {
      growthPercent: growth,
      bestDay: best?.date ?? null,
    };
  }, [analytics.last30Days]);

  const performance = getSellerPerformanceSummary({
    totalProductViews: analytics.totalProductViews,
    totalProfileViews: analytics.totalProfileViews,
    totalIntentions: analytics.totalIntentions,
    conversionRatio: analytics.conversionRatio,
    growthPercent,
    totalWhatsappClicks: analytics.totalWhatsappClicks,
    totalReviews: analytics.totalReviews,
    avgRating: analytics.avgRating,
    totalProducts: catalogo.total,
    activeProducts: catalogo.activos,
    inactiveProducts: catalogo.inactivos,
    topProducts: analytics.topProducts,
    topIntentedProducts: analytics.topIntentedProducts,
  });

  const priorityInsight = useMemo((): PriorityInsight => {
    const convPct = Number((analytics.conversionRatio * 100).toFixed(2));

    if (analytics.totalProductViews === 0) {
      return {
        id: "no-traffic",
        title: "Tu tienda aun no tiene visitas",
        description:
          "Comparte el enlace de tu tienda para empezar a atraer clientes. Sin visitas, ninguna otra metrica puede mejorar.",
        cta: { label: "Ir a mi tienda", href: "/seller/my-business" },
        severity: "critical",
      };
    }

    if (convPct < 5 && analytics.totalProductViews >= 10) {
      return {
        id: "low-conversion",
        title: "Tus visitas no se convierten en interes",
        description: `Solo el ${convPct}% de tus visitas genera interes real. Mejora fotos, precios o descripciones para captar mas atencion.`,
        cta: { label: "Mejorar productos", href: "/seller/products" },
        severity: "high",
      };
    }

    if (
      analytics.totalWhatsappClicks === 0 &&
      analytics.totalProductViews >= 20
    ) {
      return {
        id: "no-contact",
        title: "Nadie te esta contactando por WhatsApp",
        description:
          "Tienes visitas pero ningun cliente ha hecho click en tu WhatsApp. Verifica que tu numero este activo y visible.",
        cta: { label: "Configurar tienda", href: "/seller/my-business" },
        severity: "high",
      };
    }

    if (analytics.totalReviews === 0 && analytics.totalProductViews >= 15) {
      return {
        id: "no-reviews",
        title: "Sin resenas todavia",
        description:
          "Las resenas generan confianza y aumentan la conversion. Pidele a tus clientes que dejen su opinion.",
        cta: { label: "Ver mi tienda", href: "/seller/my-business" },
        severity: "medium",
      };
    }

    if (growthPercent < -20) {
      return {
        id: "traffic-decline",
        title: "Tu trafico esta cayendo",
        description: `Tus visitas bajaron un ${Math.abs(growthPercent)}% respecto a la semana anterior. Comparte tu tienda o agrega productos nuevos para recuperar el ritmo.`,
        cta: { label: "Agregar producto", href: "/seller/products/new" },
        severity: "medium",
      };
    }

    return {
      id: "healthy",
      title: "Tu tienda va por buen camino",
      description:
        "No hay problemas criticos detectados. Sigue optimizando con foco y sin abrir paneles innecesarios.",
      cta: { label: "Ver metricas", href: "#" },
      severity: "ok",
    };
  }, [
    analytics.totalProductViews,
    analytics.conversionRatio,
    analytics.totalWhatsappClicks,
    analytics.totalReviews,
    growthPercent,
  ]);

  const stats = useMemo(
    () => [
      {
        title: "Vistas de productos",
        value: analytics.totalProductViews,
        context:
          analytics.totalProductViews === 0
            ? "Todavia no hay visitas. Comparte tu tienda para empezar a atraer trafico."
            : `${analytics.totalProfileViews} visitas al perfil registradas.`,
        icon: <Eye className="h-5 w-5 text-emerald-700" />,
        interpretation: interpretMetric("views", analytics.totalProductViews),
      },
      {
        title: "Productos activos",
        value: catalogo.activos,
        context:
          catalogo.total === 0
            ? "Aun no tienes catalogo publicado."
            : `${catalogo.total} productos en total${catalogo.inactivos > 0 ? ` · ${catalogo.inactivos} inactivos` : ""}.`,
        icon: <Package className="h-5 w-5 text-sky-700" />,
      },
      {
        title: "Clicks en WhatsApp",
        value: analytics.totalWhatsappClicks,
        context:
          analytics.totalWhatsappClicks === 0
            ? "Todavia no hay contactos directos desde tu tienda."
            : `${analytics.last30WhatsappClicks} clicks en los ultimos 30 dias.`,
        icon: <MessageCircle className="h-5 w-5 text-green-700" />,
      },
      {
        title: "Conversion / confianza",
        value:
          analytics.totalReviews > 0
            ? (analytics.avgRating?.toFixed(1) ?? `${analytics.totalReviews}`)
            : `${conversionPercent}%`,
        context:
          analytics.totalReviews > 0
            ? `${analytics.totalReviews} resena${analytics.totalReviews !== 1 ? "s" : ""} publicadas.`
            : conversionPercent === 0
              ? "Aun no hay conversion registrada."
              : "Porcentaje de visitas que se transforman en interes.",
        icon:
          analytics.totalReviews > 0 ? (
            <Star className="h-5 w-5 text-amber-600" />
          ) : (
            <TrendingUp className="h-5 w-5 text-amber-700" />
          ),
        interpretation:
          analytics.totalReviews > 0
            ? undefined
            : interpretMetric("conversion", conversionPercent),
      },
    ],
    [
      analytics.totalProductViews,
      analytics.totalProfileViews,
      analytics.totalWhatsappClicks,
      analytics.last30WhatsappClicks,
      analytics.totalReviews,
      analytics.avgRating,
      catalogo.activos,
      catalogo.total,
      catalogo.inactivos,
      conversionPercent,
    ],
  );

  const actions: NextAction[] =
    performance.nextActions.length > 0
      ? performance.nextActions
      : [
          {
            label: "Agrega nuevos productos para crecer",
            href: "/seller/products/new",
            priority: "low",
            impact: "medium",
            effort: "low",
          },
        ];

  const onboardingSummary = getSellerOnboardingSummary(onboardingState);
  const onboardingIncomplete = !isSellerOnboardingComplete(onboardingState);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#f8f5ef] py-6 sm:py-8">
      {loading ? (
        <div className="space-y-5">
          <div className="h-44 animate-pulse rounded-[32px] bg-white/70" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-3xl bg-white/70"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-3xl bg-white/70"
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {onboardingIncomplete && (
            <BaseSection>
              <SellerMetricsOnboardingBanner
                label={onboardingSummary.label}
                title={onboardingSummary.title}
                description={onboardingSummary.description}
                ctaLabel={onboardingSummary.ctaLabel}
                ctaHref={onboardingSummary.ctaHref}
              />
            </BaseSection>
          )}

          <BaseSection>
            <div className="space-y-5">
              <SellerMetricsExecutiveHeader
                totalViews={analytics.totalProductViews}
                totalIntentions={analytics.totalIntentions}
                conversionPercent={conversionPercent}
                totalReviews={analytics.totalReviews}
              />

              <SellerTopSignalPanel
                summary={performance.executiveSummary}
                insight={priorityInsight}
                actions={actions}
              />

              <SellerMetricsKpiIntro />
            </div>
          </BaseSection>

          <BaseSection className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {stats.map((stat) => (
                <DashboardStatCard key={stat.title} {...stat} />
              ))}
            </div>

            <SellerAlertsStrip alerts={performance.alerts} />
          </BaseSection>

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as SellerMetricsTabId)}
            className="space-y-5 overflow-x-hidden"
          >
            <SellerMetricsTabs />

            <TabsContent value="summary">
              <SellerMetricsSummarySection
                health={performance.healthScore}
                highlights={performance.kpiHighlights}
                alerts={performance.alerts}
                sellerValidation={sellerValidation}
                sellerProducts={sellerProducts}
                sellerProfile={sellerProfile}
              />
            </TabsContent>

            <TabsContent value="traffic">
              <SellerMetricsTrafficSection
                analytics={analytics}
                totalTrend={totalTrend}
                growthPercent={growthPercent}
                bestDay={bestDay}
                isMobile={isMobile}
                conversionPercent={conversionPercent}
              />
            </TabsContent>

            <TabsContent value="products">
              <SellerMetricsProductsSection
                totalProducts={catalogo.total}
                activeProducts={catalogo.activos}
                inactiveProducts={catalogo.inactivos}
                analytics={analytics}
              />
            </TabsContent>

            <TabsContent value="reputation">
              <SellerMetricsReputationSection
                reviewInsights={reviewInsights}
                totalReviews={analytics.totalReviews}
              />
            </TabsContent>

            <TabsContent value="opportunities">
              <SellerMetricsOpportunitiesSection actions={actions} />
            </TabsContent>

            <TabsContent value="advanced">
              <SellerMetricsAdvancedSection />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </main>
  );
}
