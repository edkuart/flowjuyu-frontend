// src/app/store/[id]/page.tsx

import StoreClient from "./StoreClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type Producto = {
  id: string;
  nombre: string;
  precio: number | string;
  imagen_url?: string | null;
};

type Seller = {
  id: number;
  nombre_comercio: string;
  descripcion?: string;
  logo?: string | null;
  departamento?: string;
  municipio?: string;
  rating_avg?: number | null;
  rating_count?: number | null;
};

async function fetchStore(id: string) {
  const res = await fetch(`${API}/api/public/seller/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();

  return {
    seller: json.seller as Seller,
    initialProducts: json.products as Producto[],
  };
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { preview?: string };
}) {
  const preview = searchParams?.preview === "true";

  const data = await fetchStore(params.id);

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
      initialProducts={data.initialProducts}
      previewMode={preview}
    />
  );
}
