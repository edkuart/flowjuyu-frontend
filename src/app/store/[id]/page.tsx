// src/app/store/[id]/page.tsx

import StoreClient from "./StoreClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

async function fetchStore(id: string) {
  if (!id) return null;

  const res = await fetch(`${API}/api/public/seller/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return await res.json();
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