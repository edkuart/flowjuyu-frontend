// src/app/(main)/product/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

type ProductoImagen = {
  id: number;
  url: string;
};

type ProductoDetalle = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
  categoria?: string | null;
  departamento?: string | null;
  municipio?: string | null;
  stock?: number | null;
  vendedor_nombre?: string | null;
  vendedor_logo_url?: string | null;
  imagen_principal?: string | null;
  imagenes?: ProductoImagen[];
};

type ProductoRelacionado = {
  id: string;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
};

interface PageProps {
  params: { id: string };
}

async function getProducto(id: string): Promise<{
  product: ProductoDetalle | null;
  related: ProductoRelacionado[];
}> {
  const url = `${API}/api/products/${id}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    console.error("Error al obtener producto", res.status);
    return { product: null, related: [] };
  }

  const data = await res.json();

  // Ajusta estos nombres según tu backend
  return {
    product: data.product || data.data || null,
    related: data.related || [],
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = params;

  const { product, related } = await getProducto(id);

  if (!product) {
    return (
      <main className="min-h-[60vh] flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Producto no encontrado.</p>
      </main>
    );
  }

  const todasLasImagenes: string[] =
    product.imagenes?.map((img) => img.url) ?? [];

  if (product.imagen_principal) {
    // aseguramos que la principal vaya de primera y no se repita
    const sinDuplicar = todasLasImagenes.filter(
      (url) => url !== product.imagen_principal
    );
    todasLasImagenes.unshift(product.imagen_principal);
    todasLasImagenes.push(...sinDuplicar);
  } else if (todasLasImagenes.length === 0) {
    todasLasImagenes.push("/placeholder.jpg");
  }

  const imagePrincipal = todasLasImagenes[0];

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-8 md:px-8 lg:px-16">
      {/* MIGAS DE PAN */}
      <nav className="text-xs text-neutral-500 mb-4 space-x-1">
        <Link href="/" className="hover:underline">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:underline">
          Productos
        </Link>
        {product.categoria && (
          <>
            <span>/</span>
            <span className="capitalize">{product.categoria}</span>
          </>
        )}
      </nav>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* COLUMNA IZQUIERDA: GALERÍA */}
        <div className="space-y-4">
          {/* Imagen principal */}
          <div className="relative w-full aspect-[4/3] bg-white rounded-2xl border shadow-sm overflow-hidden">
            <Image
              src={imagePrincipal}
              alt={product.nombre}
              fill
              className="object-cover"
            />
          </div>

          {/* Miniaturas */}
          {todasLasImagenes.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {todasLasImagenes.map((img, idx) => (
                <div
                  key={`${img}-${idx}`}
                  className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer ${
                    idx === 0 ? "ring-2 ring-primary" : "hover:border-neutral-400"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.nombre} miniatura ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFO PRODUCTO */}
        <div className="space-y-6">
          {/* Título y precio */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
              {product.nombre}
            </h1>

            {product.categoria && (
              <p className="text-sm text-neutral-500 capitalize">
                Categoría: {product.categoria}
              </p>
            )}

            {product.departamento && (
              <p className="text-sm text-neutral-500">
                Origen: {product.municipio
                  ? `${product.municipio}, ${product.departamento}`
                  : product.departamento}
              </p>
            )}

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-neutral-900">
                Q{Number(product.precio).toFixed(2)}
              </span>
            </div>

            {typeof product.stock === "number" && (
              <p className="text-sm text-emerald-600">
                {product.stock > 0
                  ? `En stock: ${product.stock} unidades`
                  : "Sin stock"}
              </p>
            )}
          </div>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 h-11 rounded-full bg-black text-white font-medium hover:bg-neutral-800 transition">
              Agregar al carrito
            </button>
            <button className="flex-1 h-11 rounded-full border border-neutral-300 font-medium hover:bg-neutral-100 transition">
              Comprar ahora
            </button>
          </div>

          {/* Descripción */}
          {product.descripcion && (
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-neutral-900">
                Detalles del producto
              </h2>
              <p className="text-sm leading-relaxed text-neutral-700 whitespace-pre-line">
                {product.descripcion}
              </p>
            </section>
          )}

          {/* Vendedor */}
          {(product.vendedor_nombre || product.vendedor_logo_url) && (
            <section className="mt-4 rounded-2xl border bg-white p-4 flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border bg-neutral-100">
                <Image
                  src={product.vendedor_logo_url || "/images/tiendas/default.jpg"}
                  alt={product.vendedor_nombre || "Vendedor"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-500">Vendido por</p>
                <p className="font-medium text-neutral-900">
                  {product.vendedor_nombre || "Vendedor de Flowjuyu"}
                </p>
              </div>
              <button className="text-sm text-primary hover:underline">
                Ver tienda
              </button>
            </section>
          )}
        </div>
      </section>

      {/* PRODUCTOS RELACIONADOS */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            Productos similares
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group border rounded-2xl bg-white overflow-hidden hover:shadow-md transition"
              >
                <div className="relative w-full aspect-square bg-neutral-100">
                  <Image
                    src={p.imagen_url || "/placeholder.jpg"}
                    alt={p.nombre}
                    fill
                    className="object-cover group-hover:scale-[1.02] transition-transform"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm line-clamp-2">
                    {p.nombre}
                  </h3>
                  <p className="text-sm font-semibold text-neutral-900">
                    Q{Number(p.precio).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
