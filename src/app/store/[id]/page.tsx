// src/app/store/[id]/page.tsx

import type { Metadata } from "next";
import StoreClient from "./StoreClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";
const SITE_URL = "https://www.flowjuyu.com";

async function fetchStore(id: string) {
  if (!id) return null;

  const res = await fetch(`${API}/api/public/seller/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return await res.json();
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = String(params?.id ?? "");

  if (!id) {
    return {
      title: "Tienda | Flowjuyu",
      description: "Descubre tiendas y productos en Flowjuyu.",
    };
  }

  const data = await fetchStore(id);

  if (!data?.seller) {
    return {
      title: "Tienda no encontrada | Flowjuyu",
      description: "La tienda que buscas no está disponible.",
    };
  }

  const seller = data.seller;

  const title = seller.nombre_comercio;

  const location = [seller.municipio, seller.departamento]
    .filter(Boolean)
    .join(", ");

  const description =
    seller.descripcion?.trim() ||
    (location
      ? `Descubre los productos de ${seller.nombre_comercio} en ${location}, disponible en Flowjuyu.`
      : `Descubre los productos de ${seller.nombre_comercio}, disponible en Flowjuyu.`);

  const rawImage =
    seller.banner_url ||
    "/images/hero-cultural.jpg";

  const image = rawImage.startsWith("http")
    ? rawImage
    : `${SITE_URL}${rawImage}`;

  const url = `${SITE_URL}/store/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
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

export default async function StorePage({
  params,
}: {
  params: { id: string };
}) {
  const id = String(params?.id ?? "");

  if (!id) {
    return (
      <div className="container mx-auto py-20 text-center">
        ID inválido
      </div>
    );
  }

  const data = await fetchStore(id);

  if (!data) {
    return (
      <div className="container mx-auto py-20 text-center">
        Tienda no encontrada
      </div>
    );
  }

  return (
    <StoreClient
      seller={data.seller}
      initialProducts={data.products}
    />
  );
}