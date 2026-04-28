import type {
  SelectedVideoAsset,
  VideoCreativeBrief,
  VideoFormat,
  VideoObjective,
  VideoTemplate,
} from "@/types/video-studio";
import type { VendedorPerfil } from "@/types/db";

export const DEFAULT_VIDEO_BRIEF: VideoCreativeBrief = {
  goal: "despertar deseo de compra",
  audience: "clientes nuevos que descubren la tienda en redes sociales",
  keyBenefit: "calidad artesanal, textura y detalle hechos con cuidado",
  hook: "mostrar el producto como una pieza especial para usar o regalar",
  cta: "escribir por WhatsApp para consultar disponibilidad",
  mood: "artesanal premium",
  cameraPlan: "close-up de textura con movimiento lento de cámara",
  platform: "Instagram Reels y TikTok",
};

export const AI_DECIDE_VALUE = "que la IA decida";

const GOAL_COPY: Record<string, string> = {
  "despertar deseo de compra": "make the viewer want to buy or ask for the piece",
  "explicar valor y calidad": "show why the piece feels valuable and well made",
  "anunciar promocion": "announce a limited offer with urgency and clarity",
  "invitar a live": "invite viewers to join a live sale and ask questions",
  "presentar coleccion": "present a curated collection with a cohesive visual mood",
};

const FORMAT_COPY: Record<VideoFormat, string> = {
  "9:16": "vertical 9:16 social video",
  "1:1": "square feed video",
  "16:9": "horizontal cinematic video",
};

const OBJECTIVE_COPY: Record<VideoObjective, string> = {
  product: "product spotlight",
  promo: "short promotional ad",
  live: "live shopping teaser",
  collection: "collection reveal",
};

function compact(values: Array<string | null | undefined>): string[] {
  return values
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

export function isAiDecisionValue(value?: string | null): boolean {
  return !value?.trim() || value.trim().toLowerCase() === AI_DECIDE_VALUE;
}

function chosenOrAi(value: string | undefined, aiInstruction: string): string {
  return isAiDecisionValue(value) ? aiInstruction : value!.trim();
}

function clampPrompt(prompt: string, max = 980): string {
  if (prompt.length <= max) return prompt;
  return `${prompt.slice(0, max - 1).trim()}.`;
}

function priceLabel(value: unknown): string | null {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return `Q${amount.toLocaleString("es-GT")}`;
}

function productLine(assets: SelectedVideoAsset[]): string {
  const products = assets.filter((asset) => asset.asset_type === "product_image");
  if (products.length === 0) return "the selected handmade product";

  return products
    .slice(0, 4)
    .map((asset, index) => {
      const name = asset.metadata.product_name || `product ${index + 1}`;
      const price = priceLabel(asset.metadata.product_price);
      const sku = asset.metadata.product_sku ? `, code ${asset.metadata.product_sku}` : "";
      return compact([`${name}${sku}`, price]).join(" ");
    })
    .join("; ");
}

function customReferenceLine(assets: SelectedVideoAsset[]): string | null {
  const customAssets = assets.filter((asset) => asset.asset_type !== "product_image");
  if (customAssets.length === 0) return null;
  const labels = customAssets
    .slice(0, 3)
    .map((asset) => asset.metadata.file_name || asset.metadata.note || "supporting reference")
    .join(", ");
  return `Use the uploaded references for mood, brand cues, or supporting context: ${labels}.`;
}

function sellerContext(sellerProfile?: Partial<VendedorPerfil> | null): string | null {
  if (!sellerProfile) return null;
  const location = compact([sellerProfile.municipio, sellerProfile.departamento]).join(", ");
  return compact([
    sellerProfile.nombre_comercio ? `Brand: ${sellerProfile.nombre_comercio}` : null,
    sellerProfile.descripcion ? `Brand story: ${sellerProfile.descripcion}` : null,
    location ? `Location: ${location}` : null,
  ]).join(". ");
}

export function buildProfessionalVideoPrompt({
  brief,
  assets,
  sellerProfile,
  template,
  format,
  durationSeconds,
  stylePreset,
}: {
  brief: VideoCreativeBrief;
  assets: SelectedVideoAsset[];
  sellerProfile?: Partial<VendedorPerfil> | null;
  template?: VideoTemplate | null;
  format?: VideoFormat;
  durationSeconds?: number;
  stylePreset?: string;
}): string {
  const objective = template?.objective ? OBJECTIVE_COPY[template.objective] : "product marketing clip";
  const formatLabel = format ?? template?.format;
  const duration = durationSeconds ?? template?.duration_seconds ?? 8;
  const goal = isAiDecisionValue(brief.goal)
    ? "choose the strongest marketing goal based on the product, template, audience, and selected references"
    : GOAL_COPY[brief.goal] ?? brief.goal;
  const audience = chosenOrAi(
    brief.audience,
    "choose the most likely buyer audience from the product, brand context, and sales channel"
  );
  const keyBenefit = chosenOrAi(
    brief.keyBenefit,
    "infer the strongest benefit from the product name, price, visuals, craftsmanship, and brand story"
  );
  const hook = chosenOrAi(
    brief.hook,
    "choose a scroll-stopping opening hook that matches the product and buyer intent"
  );
  const mood = chosenOrAi(
    brief.mood,
    "choose the visual mood that best fits the brand, product, template, and platform"
  );
  const cameraPlan = chosenOrAi(
    brief.cameraPlan,
    "choose the camera movement that best reveals the product, texture, scale, and use case"
  );
  const cta = chosenOrAi(
    brief.cta,
    "choose the most natural call to action for the viewer's next step"
  );
  const style = stylePreset && stylePreset !== "ai_decide" ? `, ${stylePreset}` : "";

  const lines = compact([
    `Create a polished ${objective} for ${FORMAT_COPY[formatLabel ?? "9:16"]}, ${duration} seconds.`,
    sellerContext(sellerProfile),
    `Hero product(s): ${productLine(assets)}.`,
    customReferenceLine(assets),
    `Target audience: ${audience}. Main goal: ${goal}.`,
    `Core message: ${keyBenefit}. Opening hook: ${hook}.`,
    `Visual style: ${mood}${style}; premium social commerce, natural materials, intentional lighting, refined composition.`,
    `Shot plan: ${cameraPlan}. Start with an attention-grabbing detail, move into a clear product reveal, then hold a clean final frame for the call to action.`,
    `Motion direction: keep one primary subject movement, subtle environmental motion, smooth pacing, and believable fabric or material texture.`,
    `Final intention: make the viewer feel trust and curiosity, then ${cta}.`,
  ]);

  return clampPrompt(lines.join(" "));
}
