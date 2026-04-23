import type { ProductMedidas } from "@/types/product-edit";

const CM_PER_VARA = 83.82;
const CM_PER_INCH = 2.54;

function cleanText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
}

function cleanNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function formatNumber(value: number, maxDecimals = 2): string {
  return new Intl.NumberFormat("es-GT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

function normalizeUnit(unit: string | null | undefined): string | null {
  const value = cleanText(unit)?.toLowerCase();
  if (!value) return null;

  if (
    value === "cm" ||
    value === "cms" ||
    value === "centimetro" ||
    value === "centimetros" ||
    value === "centímetro" ||
    value === "centímetros"
  ) {
    return "cm";
  }

  return value;
}

function getDimensionValues(medidas?: ProductMedidas): number[] {
  if (!medidas) return [];

  return [medidas.largo, medidas.ancho, medidas.alto]
    .map(cleanNumber)
    .filter((value): value is number => value != null);
}

function formatDimensionList(values: number[], unit: string, maxDecimals = 2): string | null {
  if (values.length === 0) return null;
  return `${values.map((value) => formatNumber(value, maxDecimals)).join(" × ")} ${unit}`;
}

export function formatMeasuresForStore(medidas?: ProductMedidas): string | null {
  if (!medidas) return null;

  const values = getDimensionValues(medidas);
  const unit = normalizeUnit(medidas.unidad) ?? cleanText(medidas.unidad) ?? "cm";

  if (values.length === 0) return null;
  if (unit !== "cm") return formatDimensionList(values, unit);

  const varas = formatDimensionList(
    values.map((value) => value / CM_PER_VARA),
    "varas",
  );
  const cm = formatDimensionList(values, "cm");

  if (!varas || !cm) return null;
  return `${varas} · ${cm}`;
}

export function formatMeasuresHelper(medidas?: ProductMedidas): string | null {
  if (!medidas) return null;

  const values = getDimensionValues(medidas);
  const unit = normalizeUnit(medidas.unidad);

  if (values.length === 0 || unit !== "cm") return null;

  const varas = formatDimensionList(
    values.map((value) => value / CM_PER_VARA),
    "varas",
  );
  const inches = formatDimensionList(
    values.map((value) => value / CM_PER_INCH),
    "pulg",
    1,
  );

  if (!varas || !inches) return null;
  return `Equivale aprox. a ${varas} y ${inches}.`;
}
