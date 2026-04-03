// src/components/product/view/HowToUse.tsx
//
// Guía contextual de uso y cuidado del producto.
// Derive el contenido a partir del nombre de categoría normalizado.
//
// Si la categoría no coincide con ninguna entrada, usa la guía genérica.
// No muestra emojis. No duplica información ya visible en ProductSpecs.

"use client";

import { useLanguage } from "@/i18n/context/useLanguage";
import { createT } from "@/i18n/utils/t";
import esDictionary from "@/i18n/dictionaries/es";

/* ─── Tipos ───────────────────────────────────────────────── */

interface CareGuide {
  label: string;
  items: string[];
}

interface UseGuide {
  titulo: string;
  intro: string;
  sections: CareGuide[];
}

/* ─── Contenido por categoría ─────────────────────────────── */

const GUIDES: Record<string, UseGuide> = {
  corte: {
    titulo: "Cuidado del corte",
    intro: "Los cortes de tejido típico guatemalteco están hechos a mano en telar de pie. Cada hilo es intencional.",
    sections: [
      {
        label: "Lavado",
        items: [
          "Lavar a mano con agua fría o tibia.",
          "Usar jabón neutro, sin blanqueador.",
          "No torcer — presionar suavemente para escurrir.",
        ],
      },
      {
        label: "Secado y planchado",
        items: [
          "Secar a la sombra extendido horizontalmente.",
          "Planchar del revés a temperatura media.",
          "El lustre natural del hilo se conserva mejor sin calor directo.",
        ],
      },
      {
        label: "Cómo usar",
        items: [
          "Se usa enrollado como falda, con el punto de cierre al lado.",
          "Longitud estándar: 6–8 varas. Consulta al artesano si necesitas medida específica.",
          "Combina con güipil de la misma región para atuendo completo.",
        ],
      },
    ],
  },

  huipil: {
    titulo: "Cuidado del huipil",
    intro: "El huipil es una de las prendas más antiguas de Mesoamérica. Cada bordado cuenta el origen de quien lo teje.",
    sections: [
      {
        label: "Lavado",
        items: [
          "Lavar a mano, sin restregado fuerte en las áreas bordadas.",
          "Agua fría o tibia — nunca caliente, puede correr los colores.",
          "Enjuagar hasta que el agua salga limpia.",
        ],
      },
      {
        label: "Secado y conservación",
        items: [
          "Secar a la sombra, colgado por los hombros.",
          "Doblar con papel de seda para guardar a largo plazo.",
          "Evitar colgarlo por períodos muy largos — el peso puede deformar el cuello.",
        ],
      },
      {
        label: "Cómo usar",
        items: [
          "Se lleva encima del corte como parte del traje regional.",
          "También como blusa suelta sobre pantalón o falda lisa.",
          "Para usos contemporáneos, combina con denim o lino natural.",
        ],
      },
    ],
  },

  tela: {
    titulo: "Cuidado de la tela artesanal",
    intro: "Las telas tejidas en telar de pie tienen densidad y textura propias que varían con cada artesano.",
    sections: [
      {
        label: "Lavado",
        items: [
          "Primera lavada a mano para fijar colores.",
          "Después puede lavarse en ciclo delicado con agua fría.",
          "No usar secadora — encoge el tejido.",
        ],
      },
      {
        label: "Planchado y almacenaje",
        items: [
          "Planchar del revés con paño húmedo intermedio.",
          "Guardar doblada, no enrollada, para evitar arrugas permanentes.",
        ],
      },
    ],
  },

  camino: {
    titulo: "Cuidado del camino de mesa",
    intro: "Pieza decorativa y utilitaria a la vez. El tejido resiste el uso cotidiano si se cuida correctamente.",
    sections: [
      {
        label: "Lavado",
        items: [
          "Lavar a mano con jabón neutro.",
          "Para manchas, tratar de inmediato con agua fría — nunca caliente.",
          "Si lleva flecos, separarlos antes de lavar para evitar nudos.",
        ],
      },
      {
        label: "Presentación",
        items: [
          "Planchar a temperatura media del revés para mantener la textura.",
          "Puede combinarse con individual de lino natural o madera.",
        ],
      },
    ],
  },

  servilleta: {
    titulo: "Cuidado de las servilletas",
    intro: "Tejidas a mano, estas servilletas mezclan funcionalidad con artesanía textil de alta calidad.",
    sections: [
      {
        label: "Lavado",
        items: [
          "Lavado a mano o en ciclo delicado.",
          "Agua fría. No blanqueador.",
          "Primera lavada separada — puede soltar exceso de tintura.",
        ],
      },
      {
        label: "Presentación",
        items: [
          "Planchar ligeramente del revés.",
          "Doblar en triángulo o rollo para presentación en mesa.",
        ],
      },
    ],
  },

  mochila: {
    titulo: "Cuidado de la mochila",
    intro: "Las mochilas tejidas son funcionales y resistentes. El cuidado correcto extiende su vida útil años.",
    sections: [
      {
        label: "Limpieza",
        items: [
          "Limpiar con paño húmedo y jabón neutro.",
          "Evitar sumergir completamente — puede deformar la estructura.",
          "Secar con la boca abierta para mantener la forma.",
        ],
      },
      {
        label: "Uso y almacenaje",
        items: [
          "No sobrecargar — el tejido se estira con exceso de peso.",
          "Guardar vacía, rellena con papel para mantener la forma.",
        ],
      },
    ],
  },

  accesorio: {
    titulo: "Cuidado del accesorio",
    intro: "Los accesorios artesanales requieren cuidados similares a la prenda principal de la misma técnica.",
    sections: [
      {
        label: "Limpieza general",
        items: [
          "Limpiar a mano con paño húmedo.",
          "Evitar mojado completo si lleva elementos estructurales o rígidos.",
        ],
      },
      {
        label: "Conservación",
        items: [
          "Guardar en lugar seco, sin luz directa.",
          "Los colores de tintes naturales son más sensibles al sol prolongado.",
        ],
      },
    ],
  },
};

// Guía genérica para categorías no identificadas
const GUIDE_GENERICA: UseGuide = {
  titulo: "Cuidado de tu pieza artesanal",
  intro: "Las piezas artesanales requieren atención especial. Estos cuidados básicos aplican a la mayoría de textiles guatemaltecos.",
  sections: [
    {
      label: "Lavado",
      items: [
        "Lavar a mano con agua fría y jabón neutro.",
        "No usar blanqueador ni suavizante agresivo.",
        "Escurrir sin torcer — presionar suavemente.",
      ],
    },
    {
      label: "Secado y planchado",
      items: [
        "Secar a la sombra, extendido.",
        "Planchar del revés a temperatura media.",
      ],
    },
    {
      label: "Conservación",
      items: [
        "Guardar doblado en lugar seco, sin luz directa.",
        "Los tintes naturales son sensibles al sol prolongado.",
      ],
    },
  ],
};

/* ─── Normalización de categoría ─────────────────────────── */

function matchGuide(categoria?: string | null): UseGuide {
  if (!categoria) return GUIDE_GENERICA;

  const normalized = categoria.toLowerCase().trim();

  if (normalized.includes("corte")) return GUIDES.corte;
  if (normalized.includes("huipil") || normalized.includes("güipil")) return GUIDES.huipil;
  if (normalized.includes("tela")) return GUIDES.tela;
  if (normalized.includes("camino")) return GUIDES.camino;
  if (normalized.includes("servilleta")) return GUIDES.servilleta;
  if (normalized.includes("mochila") || normalized.includes("bolsa")) return GUIDES.mochila;
  if (normalized.includes("accesorio") || normalized.includes("cinturón") || normalized.includes("faja")) return GUIDES.accesorio;

  return GUIDE_GENERICA;
}

/* ─── Componentes internos ────────────────────────────────── */

function GuideSection({ label, items }: CareGuide) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40">
        {label}
      </p>
      <ul className="space-y-[6px]">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] text-[#0d0d0b]/65 leading-relaxed">
            <span className="mt-[5px] w-[4px] h-[4px] rounded-full bg-[#0d2d20]/40 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */

interface HowToUseProps {
  categoria?: string | null;
}

const TITLE_KEY_MAP: Partial<Record<string, Parameters<ReturnType<typeof createT>>[0]>> = {
  "Cuidado del corte":           "pdp.howToUseTitleCorte",
  "Cuidado del huipil":          "pdp.howToUseTitleHuipil",
  "Cuidado de la tela artesanal":"pdp.howToUseTitleTela",
  "Cuidado del camino de mesa":  "pdp.howToUseTitleCamino",
  "Cuidado de las servilletas":  "pdp.howToUseTitleServilleta",
  "Cuidado de la mochila":       "pdp.howToUseTitleMochila",
  "Cuidado del accesorio":       "pdp.howToUseTitleAccesorio",
  "Cuidado de tu pieza artesanal":"pdp.howToUseTitleGeneric",
};

const LABEL_KEY_MAP: Partial<Record<string, Parameters<ReturnType<typeof createT>>[0]>> = {
  "Lavado":                "pdp.howToUseWashing",
  "Secado y planchado":    "pdp.howToUseDryingIroning",
  "Cómo usar":             "pdp.howToUseWearing",
  "Secado y conservación": "pdp.howToUseDryingStorage",
  "Planchado y almacenaje":"pdp.howToUseIroningStorage",
  "Presentación":          "pdp.howToUsePresentation",
  "Limpieza":              "pdp.howToUseCleaning",
  "Limpieza general":      "pdp.howToUseGeneralCleaning",
  "Uso y almacenaje":      "pdp.howToUseUseStorage",
  "Conservación":          "pdp.howToUseConservation",
};

export default function HowToUse({ categoria }: HowToUseProps) {
  const { dictionary, language } = useLanguage();
  const tr = createT(dictionary ?? esDictionary);
  const guide = matchGuide(categoria);

  const localizedTitle = (() => {
    const key = TITLE_KEY_MAP[guide.titulo];
    return key ? tr(key) : guide.titulo;
  })();

  return (
    <section className="bg-white rounded-sm border border-[#0d2d20]/8 p-6 md:p-8 space-y-6">

      {/* Header */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#0d0d0b]/40">
          {tr("pdp.howToUseEyebrow")}
        </p>
        <h2 className="font-serif italic text-[20px] text-[#0d0d0b]">
          {localizedTitle}
        </h2>
        <p className="text-[13px] text-[#0d0d0b]/55 leading-relaxed">
          {guide.intro}
        </p>
      </div>

      {language !== "es" && (
        <p className="text-[11px] text-[#0d0d0b]/35 leading-relaxed">
          {tr("pdp.howToUseSpanishNote")}
        </p>
      )}

      <div className="h-px bg-[#0d2d20]/8" />

      {/* Sections — 2-col en desktop cuando hay 3+ secciones */}
      <div className={`grid gap-6 ${guide.sections.length >= 3 ? "md:grid-cols-2" : ""}`}>
        {guide.sections.map((section) => {
          const labelKey = LABEL_KEY_MAP[section.label];
          return (
            <GuideSection
              key={section.label}
              label={labelKey ? tr(labelKey) : section.label}
              items={section.items}
            />
          );
        })}
      </div>

    </section>
  );
}
