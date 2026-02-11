export function normalizeImage(url?: string | null): string | null {
  if (!url) return null;

  // Si la URL es externa (Supabase o cualquier host válido)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Si apunta a /uploads (solo imágenes locales válidas)
  if (url.startsWith("/uploads/")) {
    return url;
  }

  // Si no cumple formato válido → se invalida
  return null;
}
