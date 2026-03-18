// src/components/product/view/ArtisanStory.tsx
// Sección editorial debajo del fold.
// Reemplaza el bloque amber con emojis por un tratamiento tipográfico
// alineado con la identidad premium de Flowjuyu.

type Props = {
  ubicacion?: string;
  nombreArtesano?: string;
};

const pillars = [
  {
    label: "Hecho a mano",
    body: "Cada pieza requiere horas de trabajo manual. Ninguna es idéntica a otra — la variación es parte de su autenticidad.",
  },
  {
    label: "Compra directa",
    body: "Tu pago llega íntegro al artesano. Sin intermediarios, sin márgenes de distribución.",
  },
  {
    label: "Técnica ancestral",
    body: "Los patrones, colores y métodos de tejido provienen de tradiciones transmitidas de generación en generación en Guatemala.",
  },
];

export default function ArtisanStory({ ubicacion, nombreArtesano }: Props) {
  const origen = ubicacion || "Guatemala";
  const artesano = nombreArtesano || "artesanos guatemaltecos";

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">

      {/* Bloque principal — narrativa */}
      <div className="space-y-6">
        <p className="text-[10px] uppercase tracking-[0.30em] text-[#0d2d20]/50">
          Por qué importa
        </p>
        <h2 className="font-serif italic text-[28px] md:text-[36px] text-[#0d0d0b] leading-[1.1]">
          Hecho a mano en {origen}.
        </h2>
        <p className="text-[15px] text-[#0d0d0b]/60 leading-relaxed max-w-md">
          Esta pieza fue elaborada por {artesano}. Cada hilo, cada color y cada patrón
          refleja una tradición textil que lleva siglos construyéndose en las comunidades
          indígenas de Guatemala. Al adquirirla, no estás comprando un producto — estás
          preservando una expresión cultural viva.
        </p>
      </div>

      {/* Tres pilares — tipográficos, sin iconos */}
      <div className="space-y-8">
        {pillars.map(({ label, body }) => (
          <div key={label} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-[#0d2d20]/40" />
              <p className="text-[11px] uppercase tracking-[0.26em] text-[#0d2d20] font-semibold">
                {label}
              </p>
            </div>
            <p className="text-[14px] text-[#0d0d0b]/55 leading-relaxed pl-7">
              {body}
            </p>
          </div>
        ))}
      </div>

    </section>
  );
}
