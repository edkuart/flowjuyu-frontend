export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-") // espacios y símbolos → -
    .replace(/^-+|-+$/g, ""); // elimina guiones al inicio/fin
}

export function buildProductSlug(name: string, id: string | number) {
  return `${slugify(name)}-${id}`;
}

export function extractIdFromSlug(slug: string) {
  const parts = slug.split("-");
  return parts[parts.length - 1]; // último valor = ID
}
