import type { Metadata } from "next";
import Image from "next/image";

// ── SEO Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Cortes de Salcajá: Historia, Proceso y Tradición Textil de Guatemala | Flowjuyu",
  description:
    "Conoce cómo se elabora un corte de Salcajá: desde el amarrado del hilo hasta el tejido final. Historia real, proceso documentado y piezas disponibles de artesanos guatemaltecos.",
  openGraph: {
    title: "Cortes de Salcajá — El tejido que empieza antes del telar",
    description:
      "Hay prendas que se hacen. Y hay prendas que se construyen capa por capa, hilo por hilo, antes de que el telar entre en escena. Este es el mundo del corte de Salcajá.",
    url: "https://flowjuyu.com/cortes-salcaja",
    type: "article",
    images: [
      {
        url: "https://flowjuyu.com/cortes-salcaja/hero-mujer-corte.png",
        width: 1200,
        height: 800,
        alt: "Artesana guatemalteca sosteniendo tela jaspeada de Salcajá",
      },
    ],
  },
  alternates: {
    canonical: "https://flowjuyu.com/cortes-salcaja",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
      {children}
    </p>
  );
}

// Upgraded callout — editorial note style
function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-50 border-l-4 border-neutral-300 pl-5 pr-4 py-4 my-6 rounded-r-lg">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1">
        {label}
      </span>
      <p className="text-neutral-600 text-sm leading-loose italic">
        {children}
      </p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center text-sm font-semibold mt-0.5">
        {number}
      </div>
      <div className="flex-1 space-y-4">
        <h3 className="font-semibold text-neutral-900 text-xl leading-snug">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CortesSalcajaPage() {
  return (
    <main className="text-neutral-700 leading-relaxed antialiased">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}

      <section className="relative min-h-[70vh] flex items-center">

        {/* Background image */}
        <Image
          src="/cortes-salcaja/portal-ermita.png"
          alt="Ermita de la Concepción en Salcajá al atardecer con actividad cultural"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/30" />

        {/* Content layer */}
        <div className="relative z-10 w-full px-6 pt-28 pb-28">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Textiles de Guatemala · Salcajá
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white max-w-3xl">
              Cortes de Salcajá: el tejido que empieza antes del telar
            </h1>
            <p className="text-lg text-neutral-200 max-w-xl leading-relaxed">
              En Salcajá, un municipio del altiplano guatemalteco, la tela no
              comienza cuando se teje — comienza cuando se amarra. Aquí
              encontrarás lo que necesitas saber sobre estos tejidos: su proceso
              real, su contexto cultural y dónde conseguirlos directamente de
              quienes los elaboran.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="/categorias/cortes"
                className="inline-block bg-white text-neutral-900 font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm"
              >
                Explorar cortes disponibles
              </a>
              <a
                href="#proceso"
                className="inline-block border border-white/40 text-white font-medium px-7 py-3.5 rounded-lg hover:border-white/70 hover:bg-white/10 transition-colors text-sm backdrop-blur-sm"
              >
                Ver cómo se elaboran
              </a>
            </div>
            <p className="text-xs text-neutral-400 pt-1">
              Sin intermediarios innecesarios. Con información sobre su origen.
            </p>
          </div>
        </div>

      </section>

      {/* ── BODY CONTENT ───────────────────────────────────────────────────── */}

      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

        {/* ── INTRO: ¿Qué es un corte? ─────────────────────────────────────── */}

        <section aria-labelledby="intro-heading">
          <div className="max-w-3xl space-y-6">
            <h2
              id="intro-heading"
              className="text-2xl md:text-3xl font-bold text-neutral-900"
            >
              Antes de empezar: ¿qué es exactamente un corte?
            </h2>

            <p>
              Si no creciste en Guatemala, es probable que la palabra
              &ldquo;corte&rdquo; te haga pensar en algo diferente a lo que
              significa aquí.
            </p>
            <p>
              En el contexto textil guatemalteco, un corte es una tela larga —
              típicamente entre siete y once varas — que la mujer usa como parte
              de su traje tradicional. No llega a las manos como una prenda
              terminada. Llega como tela en bruto, y es quien la usa quien decide
              cómo cortarla, costurla y adaptarla a su cuerpo y a su tradición
              regional.
            </p>
            <p>
              Lo que hace al corte especial no es solo el resultado final. Es
              todo lo que ocurrió antes de que la tela llegara a tus manos.
            </p>
          </div>

          {/* Full-width hero editorial image */}
          <div className="my-12">
            <Image
              src="/cortes-salcaja/hero-mujer-corte.png"
              alt="Mujer guatemalteca sosteniendo varas de tela jaspeada de Salcajá con patrones en azul y morado, mercado exterior con luz de mañana"
              width={1200}
              height={800}
              className="rounded-2xl object-cover w-full h-auto shadow-sm"
            />
          </div>
        </section>

        {/* ── A. CONTEXTO CULTURAL ─────────────────────────────────────────── */}

        <section aria-labelledby="cultura-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>A · Contexto cultural</SectionLabel>
              <h2
                id="cultura-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Salcajá y su lugar en la tradición textil de Guatemala
              </h2>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              Un municipio, una identidad
            </h3>
            <p>
              Salcajá está en el departamento de Quetzaltenango, en el altiplano
              occidental de Guatemala. Es un lugar pequeño en extensión, pero con
              una presencia grande en la historia textil del país.
            </p>
            <p>
              Lo que distingue a Salcajá no es solo que produce telas — muchos
              municipios guatemaltecos tienen tradición textil. Lo que distingue a
              Salcajá es la técnica que domina: el{" "}
              <strong className="text-neutral-900">jaspeado</strong>, un método de
              teñido en el que el diseño se crea sobre el hilo antes de que llegue
              al telar.
            </p>
            <p className="text-neutral-500 italic">
              Es un proceso que invierte la lógica habitual.
            </p>
            <p>
              En la mayoría de los tejidos, primero se teje y luego — si acaso —
              se decora. En el jaspeado, el diseño se programa en el hilo desde el
              principio. La tela resultante tiene esa apariencia característica:
              manchas, rayas y degradados que parecen brotar desde adentro de la
              fibra, porque en cierta forma así es.
            </p>
          </div>

          {/* Real place — Ermita de la Concepción */}
          <div className="my-12 max-w-2xl mx-auto">
            <Image
              src="/cortes-salcaja/iglesia-la-ermita.png"
              alt="Ermita de la Concepción en Salcajá, Guatemala con mercado local y vida cotidiana"
              width={1200}
              height={800}
              className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
            />
          </div>

          <div className="max-w-3xl">
            <p className="text-neutral-500 italic leading-relaxed">
              Salcajá no es solo un punto en el mapa. Es un lugar donde la vida
              diaria, la historia y el tejido conviven — y donde cada corte tiene
              un contexto que va más allá de la tela.
            </p>
          </div>

          {/* Textile life of the municipality */}
          <div className="my-12">
            <Image
              src="/cortes-salcaja/salcaja-municipio.png"
              alt="Vista del municipio de Salcajá, Quetzaltenango, Guatemala, con talleres textiles y actividad artesanal en sus calles"
              width={1200}
              height={800}
              className="rounded-2xl object-cover w-full h-auto shadow-sm"
            />
          </div>

          <div className="max-w-3xl space-y-6">
            <h3 className="text-lg font-semibold text-neutral-900">
              Lo que convive en sus calles
            </h3>
            <p>
              Caminar por Salcajá hoy es encontrar una mezcla de tiempos.
            </p>
            <p>
              Hay talleres familiares donde el proceso se lleva a cabo de forma
              manual, paso a paso, con herramientas que no han cambiado demasiado
              en décadas. Y hay también espacios con maquinaria más moderna, donde
              parte del proceso se ha mecanizado para atender volúmenes más altos.
            </p>
            <p>
              Ninguno de los dos mundos ha reemplazado completamente al otro.
              Coexisten, a veces dentro del mismo taller. Más adelante en esta
              página explicamos con más detalle cómo se relacionan estos dos modos
              de producción — y por qué esa coexistencia importa a la hora de
              entender qué estás comprando.
            </p>
          </div>
        </section>

        {/* ── B. PROCESO ───────────────────────────────────────────────────── */}

        <section id="proceso" aria-labelledby="proceso-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl mb-12 space-y-4">
            <SectionLabel>B · El proceso</SectionLabel>
            <h2
              id="proceso-heading"
              className="text-2xl md:text-3xl font-bold text-neutral-900"
            >
              Cómo se elabora un corte: el proceso real
            </h2>
            <p className="text-sm text-neutral-500 italic leading-loose">
              Lo que sigue está basado en procesos documentados entre artesanos de
              Salcajá. No todos los talleres trabajan exactamente igual, pero
              estas etapas describen el flujo general de producción del tejido
              jaspeado.
            </p>
          </div>

          <div className="space-y-16">

            {/* Step 1 */}
            <ProcessStep number={1} title="Preparación del hilo">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm text-neutral-500 font-medium">
                  Aquí es donde empieza todo.
                </p>
                <p>
                  Antes de cualquier color, antes de cualquier patrón, está el
                  hilo. Generalmente se trabaja con hilo de algodón, aunque en la
                  producción contemporánea también se utilizan mezclas con fibras
                  sintéticas, dependiendo del taller y del tipo de tela que se
                  quiera producir. El hilo llega en conos o madejas y se organiza
                  antes de pasar a la siguiente etapa.
                </p>
                <p>
                  Este momento parece invisible — casi administrativo. Pero la
                  calidad del hilo y la forma en que se prepara determinan cómo
                  responderá al tinte y cómo se comportará en el telar semanas
                  después.
                </p>
                <Callout label="Dato interesante">
                  El tipo de fibra afecta directamente cómo absorbe el colorante.
                  El algodón natural toma el tinte de manera diferente a las
                  mezclas sintéticas, lo que influye en el tono final y en la
                  durabilidad del color.
                </Callout>
              </div>
              {/* Inset image — tighter crop feel */}
              <div className="my-10 max-w-xl">
                <Image
                  src="/cortes-salcaja/preparacion-hilo.png"
                  alt="Conos de hilo de algodón en distintos colores organizados en taller artesanal de Salcajá, preparados para el proceso de urdido y teñido"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

            {/* Step 2 */}
            <ProcessStep number={2} title="El urdido — tender el camino antes de tejer">
              <div className="max-w-2xl space-y-4">
                <p>
                  El urdido es la etapa en que los hilos se organizan en paralelo
                  para construir la base del tejido — lo que técnicamente se llama
                  la <em>urdimbre</em>. Esta disposición define tres cosas
                  fundamentales: el largo de la tela, el ancho, y la relación de
                  colores si la pieza va a llevar diseño jaspeado.
                </p>
                <p>
                  En los talleres artesanales, el urdido se hace a mano con un
                  instrumento llamado <em>urdidor</em>: un bastidor de madera o
                  metal alrededor del cual el artesano enrolla el hilo siguiendo
                  un conteo preciso.
                </p>
                <Callout label="Lo que muchas personas no saben">
                  Un error en el conteo durante el urdido no se ve de inmediato.
                  Se ve después — cuando la tela está terminada y el diseño no
                  cierra bien, o cuando la tensión del tejido es irregular. Por
                  eso, quienes urden bien son personas que han desarrollado una
                  forma de contar y moverse que es casi automática.
                </Callout>
                <p>
                  Es trabajo que parece repetitivo desde afuera. Desde adentro,
                  requiere una concentración sostenida durante horas.
                </p>
              </div>
              {/* Full-width — show the whole warping frame */}
              <div className="my-10">
                <Image
                  src="/cortes-salcaja/proceso-urdido.png"
                  alt="Artesano guatemalteco frente a urdidor de madera con hilos en distintos colores formando franjas paralelas, técnica tradicional de preparación textil en Salcajá"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

            {/* Step 3 */}
            <ProcessStep number={3} title="El amarrado — aquí se escribe el diseño">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm text-neutral-500 font-medium">
                  En este punto ocurre algo importante.
                </p>
                <p>
                  Antes de que el hilo llegue al tinte, el artesano amarra
                  porciones específicas del hilo con fibras resistentes. Estas
                  ataduras actúan como una máscara: protegen las zonas cubiertas
                  del colorante, impidiendo que el tinte penetre en esas partes.
                </p>
                <p>
                  Cuando después se quitan las ataduras, aparece el diseño:
                  manchas, rayas, degradados. Ese efecto difuminado tan
                  característico del jaspeado no es un accidente — es el resultado
                  calculado del amarrado previo.
                </p>
                <Callout label="Este detalle cambia completamente el resultado final">
                  La posición exacta de cada amarre, la tensión con que se ata, la
                  cantidad de hilo que queda cubierta — todo eso define el patrón.
                  Dos artesanos trabajando con el mismo diseño pueden producir
                  resultados ligeramente distintos, porque el amarrado es, en
                  esencia, un acto manual donde interviene el criterio de quien lo
                  hace.
                </Callout>
                <p>
                  Según testimonios de artesanos, esta etapa puede tomar desde
                  varias horas hasta días enteros, dependiendo de la complejidad
                  del diseño.
                </p>
              </div>
              {/* Tight inset — this is a close-up shot */}
              <div className="my-10 max-w-xl mx-auto">
                <Image
                  src="/cortes-salcaja/proceso-amarrado.png"
                  alt="Close-up de manos de artesano guatemalteco atando hilo con fibra resistente sobre urdimbre preparada, técnica de amarrado para crear el diseño jaspeado en Salcajá"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

            {/* Step 4 */}
            <ProcessStep number={4} title="El teñido — color con historia y con química">
              <div className="max-w-2xl space-y-4">
                <p>
                  Con el hilo amarrado, llega el momento del color.
                </p>
                <p>
                  Históricamente, los tintes utilizados en Guatemala provenían de
                  fuentes naturales: plantas como el añil, minerales, y animales
                  como la cochinilla — un insecto que produce uno de los rojos más
                  intensos y duraderos que se conocen. El proceso de obtener y
                  fijar estos tintes naturales es laborioso, y los tonos
                  resultantes tienen una calidez particular, ligeramente irregular,
                  que muchos reconocen a primera vista.
                </p>
                <p>
                  En la producción contemporánea de Salcajá, los tintes químicos
                  industriales son también parte del paisaje. Permiten colores más
                  intensos y uniformes, son más fáciles de conseguir y reducen el
                  tiempo de producción.
                </p>
                <Callout label="Lo interesante de este paso">
                  No existe una jerarquía simple entre lo natural y lo sintético.
                  Hay piezas con tintes naturales que son extraordinarias. Hay
                  piezas con tintes químicos que también lo son. Lo que importa es
                  que el comprador sepa qué tiene en sus manos — y eso es
                  exactamente lo que Flowjuyu busca hacer visible.
                </Callout>
              </div>
              {/* Full-width — outdoor scene needs room to breathe */}
              <div className="my-10">
                <Image
                  src="/cortes-salcaja/proceso-tenido.png"
                  alt="Madejas de hilo recién teñidas en azul profundo y bordó oscuro colgando al aire libre en taller de Salcajá, gotas de tinte escurriendo con luz de tarde"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

            {/* Step 5 */}
            <ProcessStep number={5} title="El tejido — cuando todo lo anterior cobra forma">
              <div className="max-w-2xl space-y-4">
                <p>
                  Llegamos al momento que la mayoría imagina cuando piensa en un
                  tejido. Pero si has leído hasta aquí, ya sabes que el trabajo
                  más complejo ya ocurrió antes.
                </p>
                <p>En Salcajá coexisten dos formas principales de tejer:</p>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-neutral-400 mt-1 flex-shrink-0">—</span>
                    <span>
                      <strong className="text-neutral-900">El telar manual</strong>{" "}
                      — ya sea de cintura o de pie — es el método en que el
                      artesano controla directamente cada pasada del hilo de trama
                      entre los hilos de urdimbre. El ritmo es lento. Cada
                      centímetro de tela implica un movimiento físico deliberado.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-neutral-400 mt-1 flex-shrink-0">—</span>
                    <span>
                      <strong className="text-neutral-900">
                        Los telares mecánicos y computarizados
                      </strong>{" "}
                      permiten mayor velocidad y volumen. En algunos talleres, se
                      usan para la etapa del tejido mientras que el urdido y el
                      amarrado siguen siendo manuales.
                    </span>
                  </li>
                </ul>
                <Callout label="Dato interesante">
                  El uso de telares mecánicos no convierte automáticamente una
                  pieza en de menor calidad. La calidad depende también del hilo,
                  del diseño, del teñido, y del cuidado en cada etapa previa. Un
                  corte puede ser tejido con máquina y aun así representar el
                  resultado de días de trabajo manual en sus etapas anteriores.
                </Callout>
              </div>
              {/* Full-width — room to show the full loom setup */}
              <div className="my-10">
                <Image
                  src="/cortes-salcaja/proceso-telar.png"
                  alt="Telar de pie en taller artesanal de Salcajá con tela jaspeada parcialmente tejida, hilos de urdimbre tensados verticalmente, luz natural desde ventana lateral"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

            {/* Step 6 */}
            <ProcessStep number={6} title="El acabado — el último acto antes de llegar a tus manos">
              <div className="max-w-2xl space-y-4">
                <p>
                  Una vez que la tela sale del telar, se revisa. Se verifica la
                  tensión, se cortan los hilos sueltos, se dobla en varas. Un
                  corte estándar mide entre siete y once varas — aproximadamente
                  seis a nueve metros de largo, aunque la medida exacta varía
                  según el uso y el taller.
                </p>
                <p>
                  Este momento de revisión y cierre es silencioso pero necesario.
                  Es donde el artesano evalúa el trabajo completo. Donde se ve si
                  el diseño cerró bien, si el color quedó parejo, si la tela tiene
                  la caída correcta.
                </p>
                <p className="text-neutral-500 italic">
                  Es también el momento en que la pieza deja de ser un proceso
                  para convertirse en un objeto.
                </p>
              </div>
              {/* Inset — intimate, final moment */}
              <div className="my-10 max-w-2xl">
                <Image
                  src="/cortes-salcaja/proceso-acabado.png"
                  alt="Tela jaspeada de Salcajá terminada siendo doblada y medida en varas sobre mesa de madera, manos de artesano en primer plano con colores vivos del tejido"
                  width={1200}
                  height={800}
                  className="rounded-2xl object-cover w-full h-auto shadow-sm"
                />
              </div>
            </ProcessStep>

          </div>
        </section>

        {/* ── C. TRADICIÓN Y MODERNIDAD ────────────────────────────────────── */}

        <section aria-labelledby="tradicion-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>C · Tradición y transformación</SectionLabel>
              <h2
                id="tradicion-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Lo manual y lo moderno: dos tiempos en el mismo oficio
              </h2>
            </div>

            <p>
              La imagen del artesano que trabaja exactamente igual que su abuelo
              es romántica. A veces es parcialmente cierta. Pero en Salcajá, como
              en cualquier lugar donde un oficio ha sobrevivido, la realidad es
              más matizada.
            </p>
            <p>
              Los telares computarizados llegaron y se quedaron. Permiten
              reproducir diseños complejos con velocidad, mantener estándares
              uniformes en pedidos grandes, y hacer viable económicamente la
              producción para mercados que demandan volumen. Para muchos talleres,
              la mecanización no fue una traición al oficio — fue la condición
              para que el oficio sobreviviera.
            </p>
            <p>
              Al mismo tiempo, hay artesanos que eligen el proceso manual de
              principio a fin. Por convicción. Por el tipo de cliente al que
              sirven. Porque hay resultados — en textura, en variación, en tacto —
              que la máquina todavía no replica de la misma manera.
            </p>
            <Callout label="Lo que muchas personas no saben">
              Dentro de un mismo taller puede haber etapas manuales y etapas
              mecánicas en el proceso de una sola pieza. El amarrado a mano y el
              tejido en máquina no se cancelan mutuamente — son parte de un
              proceso híbrido que muchos artesanos han construido pragmáticamente.
            </Callout>
            <p>
              Lo que Flowjuyu busca es que esa información llegue al comprador de
              forma clara. No para juzgar un método como superior al otro, sino
              para que quien compra entienda exactamente qué tiene en sus manos.
            </p>
          </div>

          {/* Full-width — workshop needs context */}
          <div className="my-12">
            <Image
              src="/cortes-salcaja/taller-artesanal.png"
              alt="Taller textil de Salcajá con convivencia de telar manual tradicional y maquinaria moderna, artesano trabajando en el área manual con luz natural"
              width={1200}
              height={800}
              className="rounded-2xl object-cover w-full h-auto shadow-sm"
            />
          </div>
        </section>

        {/* ── D. FLOWJUYU ──────────────────────────────────────────────────── */}

        <section aria-labelledby="flowjuyu-heading">
          <div className="bg-neutral-50 rounded-2xl px-8 py-12 md:px-14 md:py-16 space-y-6">
            <div>
              <SectionLabel>D · Por qué Flowjuyu</SectionLabel>
              <h2
                id="flowjuyu-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Un puente, no un intermediario
              </h2>
            </div>

            <div className="max-w-2xl space-y-5">
              <p>
                Hay una distancia que muchas plataformas de comercio ignoran. No es
                la distancia geográfica entre Guatemala y quien compra desde otro
                país. Es la distancia entre lo que se vende y lo que esa cosa
                realmente es — de dónde viene, quién la hizo, en qué condiciones,
                con qué materiales, con cuántas horas de trabajo.
              </p>
              <p>
                Esa distancia, en el mercado de textiles guatemaltecos, ha sido
                históricamente grande. Los cortes pasan por distribuidores,
                intermediarios y revendedores hasta llegar a manos del comprador
                final. En ese trayecto, el precio sube, el contexto desaparece, y
                la persona que tejió la pieza queda invisible.
              </p>
              <p className="font-semibold text-neutral-900 text-lg">
                Flowjuyu nació para reducir esa distancia.
              </p>
            </div>

            <ul className="max-w-2xl space-y-4 pt-2">
              {[
                {
                  label: "Visibilizamos el origen.",
                  text: "Cada pieza tiene información sobre la región y, cuando es posible, sobre quien la elaboró.",
                },
                {
                  label: "Describimos el proceso con honestidad.",
                  text: "Si fue tejido en telar manual, lo decimos. Si tiene componentes mecánicos, también.",
                },
                {
                  label: "Eliminamos capas innecesarias.",
                  text: "Conectamos directamente con vendedores y artesanos guatemaltecos.",
                },
                {
                  label: "Educamos antes de vender.",
                  text: "Porque una persona que entiende lo que tiene en sus manos valora distinto lo que compra.",
                },
              ].map(({ label, text }) => (
                <li key={label} className="flex gap-3 items-start">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed">
                    <strong className="text-neutral-900">{label}</strong> {text}
                  </span>
                </li>
              ))}
            </ul>

            <p className="max-w-2xl pt-2">
              Si estás aquí porque te interesa un corte de Salcajá, lo que
              encontrarás en Flowjuyu no es solo un producto — es contexto. Y el
              contexto cambia todo.
            </p>

            {/* Inset closing image — intimate, warm */}
            <div className="my-8 max-w-2xl mx-auto">
              <Image
                src="/cortes-salcaja/hero-mujer-corte.png"
                alt="Artesana guatemalteca sosteniendo un corte jaspeado extendido, mostrando los patrones del tejido de Salcajá con luz natural cálida"
                width={1200}
                height={800}
                className="rounded-2xl object-cover w-full h-auto shadow-sm"
              />
            </div>

            <div className="pt-2">
              <a
                href="/categorias/cortes"
                className="inline-block bg-neutral-900 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors text-sm"
              >
                Ver cortes disponibles
              </a>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}

        <section aria-labelledby="faq-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl">
            <SectionLabel>Preguntas frecuentes</SectionLabel>
            <h2
              id="faq-heading"
              className="text-2xl md:text-3xl font-bold text-neutral-900 mb-10"
            >
              Lo que más nos preguntan
            </h2>

            <div className="space-y-10">
              {[
                {
                  q: "¿Qué es un corte guatemalteco?",
                  a: (
                    <>
                      <p className="mb-4">
                        Un corte es una tela larga — típicamente entre siete y
                        once varas — que forma parte del traje tradicional femenino
                        en Guatemala. No es una prenda terminada: es la tela en
                        bruto que la mujer luego adapta a su uso, su cuerpo y su
                        tradición regional.
                      </p>
                      <p>
                        En muchas comunidades guatemaltecas, el corte que usa una
                        mujer comunica su origen geográfico, su identidad cultural
                        y, en algunos contextos, su estado civil o su pertenencia
                        a una comunidad específica. Es una prenda con lenguaje
                        propio.
                      </p>
                    </>
                  ),
                },
                {
                  q: "¿De dónde vienen los cortes de Salcajá específicamente?",
                  a: (
                    <p>
                      Salcajá es un municipio del departamento de Quetzaltenango,
                      en el altiplano occidental de Guatemala. Es conocido
                      especialmente por su producción de telas jaspeadas — tejidos
                      donde el diseño se crea sobre el hilo antes de tejer, usando
                      la técnica del amarrado previo al teñido. Los cortes de
                      Salcajá se distribuyen tanto en mercados locales como en
                      ciudades guatemaltecas y, cada vez más, a compradores
                      internacionales.
                    </p>
                  ),
                },
                {
                  q: "¿Los cortes de Salcajá son completamente hechos a mano?",
                  a: (
                    <p>
                      Depende del taller y del proceso específico. Algunos cortes
                      se elaboran con técnicas manuales en todas sus etapas.
                      Otros incorporan telares mecánicos o computarizados en la
                      etapa del tejido, aunque etapas anteriores como el amarrado
                      y el urdido siguen siendo manuales en muchos casos. No existe
                      una respuesta única — y esa es precisamente la razón por la
                      que en Flowjuyu buscamos que esa información esté disponible
                      para cada pieza.
                    </p>
                  ),
                },
                {
                  q: "¿Qué materiales se usan para hacer un corte?",
                  a: (
                    <p>
                      Tradicionalmente se trabaja con hilo de algodón. En la
                      producción contemporánea también se usan mezclas con fibras
                      sintéticas. En cuanto a los tintes, existen talleres que
                      trabajan con colorantes naturales — derivados de plantas como
                      el añil, minerales, o insectos como la cochinilla — y otros
                      que usan tintes químicos industriales. Algunos talleres
                      combinan ambos métodos. Cada uno produce resultados distintos
                      en tono, textura y durabilidad del color.
                    </p>
                  ),
                },
                {
                  q: "¿Cuánto tiempo tarda en hacerse un corte?",
                  a: (
                    <p>
                      No existe un tiempo estándar, porque depende de múltiples
                      factores: la complejidad del diseño, el método de tejido, si
                      el proceso es manual o tiene apoyo mecánico, y el tamaño de
                      la pieza. Lo que sí podemos decir con claridad es que etapas
                      como el amarrado pueden tomar desde varias horas hasta días
                      completos, según testimonios de artesanos. Es trabajo que no
                      admite prisa si se quiere un resultado de calidad.
                    </p>
                  ),
                },
                {
                  q: "¿Puedo comprar cortes de Salcajá desde fuera de Guatemala?",
                  a: (
                    <p>
                      Sí. En Flowjuyu puedes explorar piezas disponibles de
                      artesanos y vendedores guatemaltecos, con información sobre
                      su origen y proceso. Nuestro objetivo es que esa compra sea
                      transparente y directa — que el valor de la pieza llegue a
                      quien la elaboró y que tú recibas lo que realmente buscabas.
                    </p>
                  ),
                },
              ].map(({ q, a }) => (
                <div
                  key={q}
                  className="border-b border-neutral-100 pb-10 last:border-0 last:pb-0"
                >
                  <h3 className="font-semibold text-neutral-900 text-lg mb-3">
                    {q}
                  </h3>
                  <div className="text-neutral-600 leading-loose text-[15px] space-y-3">
                    {a}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER NOTE ──────────────────────────────────────────────────── */}

        <footer className="border-t border-neutral-200 pt-10">
          <p className="text-xs text-neutral-400 leading-loose max-w-2xl">
            Esta página fue elaborada con información documental sobre procesos
            artesanales en Salcajá y con referencia directa a testimonios de
            artesanos de la región. El objetivo es ser una fuente confiable, no
            un catálogo genérico. Si eres artesano o vendedor y quieres publicar
            tus cortes en Flowjuyu,{" "}
            <a
              href="/vender"
              className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
            >
              puedes registrarte como vendedor desde nuestra plataforma
            </a>
            .
          </p>
        </footer>

      </div>
    </main>
  );
}
