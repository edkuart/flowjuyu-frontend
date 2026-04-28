/**
 * Estimación de costo de video en el frontend.
 * Mirror de la lógica del backend — no hace llamadas de red.
 * Los valores en centavos USD se convierten a Quetzales para mostrar al seller.
 */

import type { ProviderModelConfig, SupportedProvider } from "@/types/video-studio";

// Tipo de cambio aproximado USD → GTQ
const USD_TO_GTQ = 7.75;

// Configuración espejo de backend/providers/types.ts
// Mantener sincronizado cuando se agreguen modelos.
export const PROVIDER_MODEL_CONFIGS: ProviderModelConfig[] = [
  {
    provider: "mock",
    model: "default",
    label: "Simulación (sin costo)",
    badge: undefined,
    costCentsMin: 0,
    costCentsMax: 0,
    estimatedSeconds: 13,
    supportsI2V: false,
    qualityScore: 1,
  },
  {
    provider: "fal",
    model: "luma-dream-machine",
    label: "Luma Dream Machine",
    badge: "recommended",
    costCentsMin: 2,
    costCentsMax: 5,
    estimatedSeconds: 90,
    supportsI2V: true,
    qualityScore: 4,
  },
  {
    provider: "fal",
    model: "kling-video",
    label: "Kling 1.6",
    badge: "cheapest",
    costCentsMin: 1,
    costCentsMax: 3,
    estimatedSeconds: 120,
    supportsI2V: true,
    qualityScore: 3,
  },
  {
    provider: "runway",
    model: "gen3a_turbo",
    label: "Runway Gen-3 Turbo",
    badge: "premium",
    costCentsMin: 15,
    costCentsMax: 30,
    estimatedSeconds: 60,
    supportsI2V: true,
    qualityScore: 5,
  },
];

/**
 * Retorna la estimación de costo en centavos USD.
 * durationSeconds se usa para escalar el costo proporcionalmente (base 10s).
 */
export function estimateCostCents(
  provider: string,
  model: string,
  durationSeconds = 10
): { min: number; max: number; midpoint: number } {
  const config = PROVIDER_MODEL_CONFIGS.find(
    (m) => m.provider === provider && m.model === model
  );
  if (!config) return { min: 0, max: 0, midpoint: 0 };
  const scale = durationSeconds / 10;
  return {
    min: Math.round(config.costCentsMin * scale),
    max: Math.round(config.costCentsMax * scale),
    midpoint: Math.round(((config.costCentsMin + config.costCentsMax) / 2) * scale),
  };
}

/**
 * Formatea costo para mostrar al seller en GTQ (Quetzales).
 * Ejemplo: "~Q0.15" o "~Q3.50"
 */
export function formatCostGTQ(
  provider: string,
  model: string,
  durationSeconds = 10
): string {
  if (provider === "mock") return "Gratis (simulación)";
  const { min, max } = estimateCostCents(provider, model, durationSeconds);
  if (min === 0 && max === 0) return "Costo desconocido";

  const minGTQ = (min / 100) * USD_TO_GTQ;
  const maxGTQ = (max / 100) * USD_TO_GTQ;

  if (Math.abs(maxGTQ - minGTQ) < 0.05) {
    return `~Q${maxGTQ.toFixed(2)}`;
  }
  return `~Q${minGTQ.toFixed(2)} – Q${maxGTQ.toFixed(2)}`;
}

/**
 * Formatea el tiempo estimado de generación.
 */
export function formatEstimatedTime(seconds: number): string {
  if (seconds < 60) return `~${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} min`;
}
