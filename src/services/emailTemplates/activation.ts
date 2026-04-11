import { renderEmailShell } from "./shared";

type ActivationTemplateInput = {
  sellerName: string;
  ctaUrl: string;
};

export function renderActivationEmail(input: ActivationTemplateInput): string {
  return renderEmailShell({
    previewText: "Tu tienda sigue lista. Solo falta publicar tu primer producto.",
    title: "Publica tu primer producto",
    intro: `Hola ${input.sellerName}, ya pasaron 72 horas desde tu registro y tu tienda sigue lista para avanzar.`,
    body: "Todavia no vemos un producto publicado. Empieza con uno: agrega una foto clara, un precio visible y una descripcion breve para activar tu vitrina.",
    ctaLabel: "Crear mi producto",
    ctaUrl: input.ctaUrl,
    closing: "Un solo producto bien presentado basta para empezar a aparecer frente a compradores.",
  });
}
