// src/services/sellerAnalytics.ts

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

/* ======================================================
   📊 Tipos
====================================================== */

export type SellerAnalyticsResponse = {
  success: boolean;

  totalProductViews: number;
  totalProfileViews: number;

  topProducts: {
    id: string;
    nombre: string;
    total_views: number;
  }[];

  last30Days: {
    date: string;
    product_views: number;
    profile_views: number;
  }[];
};

/* ======================================================
   🔥 Fetch Analytics
====================================================== */

export async function fetchSellerAnalytics(): Promise<SellerAnalyticsResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const res = await fetch(`${API}/api/seller/analytics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error obteniendo analytics del vendedor");
  }

  const data = await res.json();

  // 🔒 Seguridad defensiva por si backend cambia algo
  return {
    success: data.success ?? true,
    totalProductViews: data.totalProductViews ?? 0,
    totalProfileViews: data.totalProfileViews ?? 0,
    topProducts: data.topProducts ?? [],
    last30Days: data.last30Days ?? [],
  };
}
