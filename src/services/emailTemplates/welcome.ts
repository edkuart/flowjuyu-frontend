import { renderEmailShell } from "./shared";

type WelcomeTemplateInput = {
  sellerName: string;
  ctaUrl: string;
};

export function renderWelcomeEmail(input: WelcomeTemplateInput): string {
  return renderEmailShell({
    previewText: "Tu tienda ya dio el primer paso en Flowjuyu.",
    title: "Tu tienda ya está en marcha",
    intro: `Hola ${input.sellerName}, ya tienes tu espacio en Flowjuyu listo para arrancar.`,
    body: "El siguiente paso es simple: completa tu onboarding y sube tu primer producto para que los compradores puedan encontrarte.",
    ctaLabel: "Completar mi tienda",
    ctaUrl: input.ctaUrl,
    closing: "Haz una sola cosa hoy: termina el primer paso y seguimos construyendo contigo.",
  });
}
