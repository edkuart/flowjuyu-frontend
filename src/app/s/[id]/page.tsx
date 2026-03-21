// src/app/s/[id]/page.tsx
//
// Short-URL seller storefront — designed to be QR-ready and shareable.
// Uses the same data and rendering as /store/[id] but lives at a shorter path.
//
// Products link to /p/[internal_code] (handled inside StoreClient).

import type { Metadata } from "next";
import StoreClient from "@/app/store/[id]/StoreClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.flowjuyu.com";

async function fetchStore(id: string) {
  try {
    const res = await fetch(`${API}/api/public/seller/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchStore(params.id);

  if (!data?.seller) {
    return {
      title: "Tienda | Flowjuyu",
      description: "Descubre tiendas y productos artesanales en Flowjuyu.",
    };
  }

  const { seller } = data;
  const location = [seller.municipio, seller.departamento].filter(Boolean).join(", ");
  const description =
    seller.descripcion?.trim() ||
    (location
      ? `Descubre los productos de ${seller.nombre_comercio} en ${location}, disponible en Flowjuyu.`
      : `Descubre los productos de ${seller.nombre_comercio}, disponible en Flowjuyu.`);

  const image = seller.banner_url?.startsWith("http")
    ? seller.banner_url
    : `${SITE_URL}/images/hero-cultural.jpg`;

  return {
    title: `${seller.nombre_comercio} | Flowjuyu`,
    description,
    openGraph: {
      title: seller.nombre_comercio,
      description,
      url: `${SITE_URL}/s/${params.id}`,
      siteName: "Flowjuyu",
      locale: "es_GT",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: seller.nombre_comercio }],
    },
    twitter: {
      card: "summary_large_image",
      title: seller.nombre_comercio,
      description,
      images: [image],
    },
  };
}

export default async function SellerShortPage({
  params,
}: {
  params: { id: string };
}) {
  const id = String(params?.id ?? "");

  if (!id || isNaN(Number(id))) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-3 px-4">
        <p className="font-serif italic text-3xl text-neutral-400">Tienda no encontrada</p>
        <p className="text-sm text-neutral-400">El enlace que seguiste no es válido.</p>
      </div>
    );
  }

  const data = await fetchStore(id);

  if (!data?.seller) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-3 px-4">
        <p className="font-serif italic text-3xl text-neutral-400">Tienda no encontrada</p>
        <p className="text-sm text-neutral-400">
          Es posible que esta tienda haya sido retirada o aún no esté disponible.
        </p>
      </div>
    );
  }

  return (
    <StoreClient
      seller={data.seller}
      initialProducts={data.products ?? []}
    />
  );
}
