import type { Metadata } from "next";

import LiveStoreClient from "./LiveStoreClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const SITE_URL = "https://www.flowjuyu.com";

async function fetchStore(id: string) {
  if (!id) return null;

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
  const id = String(params?.id ?? "");
  const data = await fetchStore(id);

  if (!data?.seller) {
    return {
      title: "Live | Flowjuyu",
      description: "Explora las piezas en vivo de Flowjuyu.",
    };
  }

  const seller = data.seller;
  const title = `${seller.nombre_comercio} en vivo | Flowjuyu`;
  const description =
    seller.live_message?.trim() ||
    `Descubre las piezas que ${seller.nombre_comercio} está mostrando en vivo ahora mismo.`;
  const rawImage =
    seller.live_external_preview?.image_url ||
    seller.live_featured_products?.[0]?.imagen_url ||
    seller.banner_url ||
    "/images/hero-cultural.jpg";
  const image = rawImage.startsWith("http")
    ? rawImage
    : `${SITE_URL}${rawImage}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/store/${id}/live`,
      siteName: "Flowjuyu",
      locale: "es_GT",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: seller.nombre_comercio,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function StoreLivePage({
  params,
}: {
  params: { id: string };
}) {
  const id = String(params?.id ?? "");
  const data = await fetchStore(id);

  if (!id || !data?.seller) {
    return (
      <div className="container mx-auto py-20 text-center">
        Live no disponible
      </div>
    );
  }

  return (
    <LiveStoreClient
      seller={data.seller}
      initialProducts={data.products ?? []}
    />
  );
}
