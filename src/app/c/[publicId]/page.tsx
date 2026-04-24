// src/app/c/[publicId]/page.tsx
import type { Metadata } from "next";
import CollectionPublicClient from "./CollectionPublicClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchCollection(publicId: string) {
  const res = await fetch(`${API}/api/collections/public/c/${publicId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.ok ? json.data : null;
}

export async function generateMetadata({
  params,
}: {
  params: { publicId: string };
}): Promise<Metadata> {
  const data = await fetchCollection(params.publicId);

  if (!data) {
    return {
      title: "Colección | Flowjuyu",
      description: "Descubre colecciones de moda en Flowjuyu.",
    };
  }

  const title = `${data.name} — ${data.seller?.nombre_comercio ?? "Flowjuyu"}`;
  const description =
    data.description?.trim() ||
    `Colección de ${data.seller?.nombre_comercio ?? "vendedor"} con ${data.product_count ?? 0} productos.`;

  const image =
    data.promo_image_url ??
    data.background_image_url ??
    "/images/hero-cultural.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_GT",
      siteName: "Flowjuyu",
      images: image ? [{ url: image, width: 1200, height: 630, alt: data.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function CollectionPublicPage({
  params,
}: {
  params: { publicId: string };
}) {
  const data = await fetchCollection(params.publicId);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <p className="text-2xl font-semibold text-neutral-800">Colección no encontrada</p>
          <p className="mt-2 text-sm text-neutral-500">
            Este enlace puede haber expirado o la colección no está publicada.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  return <CollectionPublicClient collection={data} />;
}
