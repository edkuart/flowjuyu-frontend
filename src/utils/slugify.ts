export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, "-")            // espacios → guiones
    .replace(/[^a-z0-9-]/g, "");     // limpia símbolos
}
