export type SellerOnboardingState =
  | "NEW_USER"
  | "SELLER_REGISTERED"
  | "PROFILE_STARTED"
  | "FIRST_PRODUCT_STARTED"
  | "FIRST_PRODUCT_PUBLISHED"
  | "ACTIVATED";

export interface SellerOnboardingStatus {
  onboarding_state: SellerOnboardingState;
  checklist: {
    profile_completed: boolean;
    first_product_submitted: boolean;
    profile_photo_uploaded: boolean;
    whatsapp_linked: boolean;
  };
}

export const SELLER_ONBOARDING_COMPLETE_STATES: SellerOnboardingState[] = [
  "FIRST_PRODUCT_PUBLISHED",
  "ACTIVATED",
];

export function isSellerOnboardingComplete(
  state: SellerOnboardingState | null | undefined,
): boolean {
  return !!state && SELLER_ONBOARDING_COMPLETE_STATES.includes(state);
}

export function getSellerOnboardingStep(
  state: SellerOnboardingState | null | undefined,
): 0 | 1 | 2 {
  switch (state) {
    case "FIRST_PRODUCT_PUBLISHED":
    case "ACTIVATED":
      return 2;
    case "PROFILE_STARTED":
    case "FIRST_PRODUCT_STARTED":
      return 1;
    default:
      return 0;
  }
}

export function getSellerOnboardingSummary(
  state: SellerOnboardingState | null | undefined,
): {
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
} {
  if (isSellerOnboardingComplete(state)) {
    return {
      label: "Activacion completada",
      title: "Tu tienda ya supero la fase inicial",
      description:
        "Puedes operar normalmente y revisar tus metricas sin que onboarding interfiera con otras secciones.",
      ctaLabel: "Ir al dashboard",
      ctaHref: "/seller/dashboard",
    };
  }

  if (state === "FIRST_PRODUCT_STARTED" || state === "PROFILE_STARTED") {
    return {
      label: "Onboarding en progreso",
      title: "Todavia te faltan pasos para activar tu tienda",
      description:
        "Completa tu perfil y publica tu primer producto. Tus metricas pueden mostrarse vacias mientras terminas esta etapa.",
      ctaLabel: "Continuar onboarding",
      ctaHref: "/seller/onboarding",
    };
  }

  return {
    label: "Onboarding pendiente",
    title: "Tu tienda aun esta en configuracion inicial",
    description:
      "Primero completa la puesta en marcha del seller. El dashboard y las metricas seguiran disponibles como modulos separados.",
    ctaLabel: "Empezar onboarding",
    ctaHref: "/seller/onboarding",
  };
}
