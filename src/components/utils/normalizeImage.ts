export function normalizeImage(url?: string | null): string | null {
  if (!url || url.trim() === "") return null;

  // Si parece URL remota válida
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  // Si viene como "/uploads/..." => NO existe -> null
  if (url.startsWith("/uploads/")) return null;

  return null;
}
