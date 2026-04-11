import { renderEmailShell } from "./shared";

type Week1TemplateInput = {
  sellerName: string;
  ctaUrl: string;
};

export function renderWeek1Email(input: Week1TemplateInput): string {
  return renderEmailShell({
    previewText: "Tu tienda ya esta lista para mejorar su primera visibilidad.",
    title: "Mejora tu tienda para conseguir visitas",
    intro: `Hola ${input.sellerName}, ya pasó tu primera semana desde el registro.`,
    body: "Aun no vemos visitas en tu tienda. Entra y mejora tres cosas: fotos mas claras, descripcion con material y tamano, y una tienda que puedas compartir con confianza.",
    ctaLabel: "Mejorar mi tienda",
    ctaUrl: input.ctaUrl,
    closing: "Empieza con mejoras pequenas pero visibles. Eso suele mover la primera visita mas que un tutorial largo.",
  });
}
