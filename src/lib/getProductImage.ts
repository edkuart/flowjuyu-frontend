type ProductImageSource = {
  imagenes?: Array<{ url: string } | string> | null;
  imagen_url?: string | null;
};

const FALLBACK = "/images/placeholder.png";

function canUseImageUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;

  const value = url.trim();
  if (!value) return false;
  if (value.startsWith("/")) return true;

  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function getProductImage(
  producto: ProductImageSource,
  fallback: string = FALLBACK
): string {
  if (Array.isArray(producto.imagenes) && producto.imagenes.length > 0) {
    const first = producto.imagenes[0];
    const url = typeof first === "string" ? first : first?.url;
    if (canUseImageUrl(url)) return url.trim();
  }
  if (canUseImageUrl(producto.imagen_url)) return producto.imagen_url.trim();
  return fallback;
}
