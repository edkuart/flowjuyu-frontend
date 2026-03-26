type ProductImageSource = {
  imagenes?: Array<{ url: string } | string> | null;
  imagen_url?: string | null;
};

const FALLBACK = "/images/placeholder.png";

export function getProductImage(
  producto: ProductImageSource,
  fallback: string = FALLBACK
): string {
  if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    const first = producto.imagenes[0];
    const url = typeof first === "string" ? first : first?.url;
    if (url) return url;
  }
  return producto.imagen_url || fallback;
}
