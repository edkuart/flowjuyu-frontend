import type { Metadata } from "next";
import Image from "next/image";

// ── SEO Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Huipiles de Guatemala: significado, origen y estilos | Flowjuyu",
  description:
    "Guía completa sobre los huipiles de Guatemala: qué son, qué significan sus bordados, cómo se elaboran y qué diferencia a los huipiles de Nebaj, Atitlán y otras regiones.",
  openGraph: {
    title: "Huipiles de Guatemala: significado, origen y estilos",
    description:
      "El huipil es la prenda más reconocible del traje típico guatemalteco. Conoce su significado cultural, su proceso de elaboración y las diferencias regionales que lo hacen único.",
    url: "https://flowjuyu.com/huipiles-guatemala",
    type: "article",
  },
  alternates: {
    canonical: "https://flowjuyu.com/huipiles-guatemala",
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

function Callout({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-neutral-50 border-l-4 border-neutral-300 pl-5 pr-4 py-4 rounded-r-lg my-6">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">
        {label}
      </span>
      <div className="text-neutral-600 text-sm leading-loose space-y-3">
        {children}
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function HuipilesGuatemalaPage() {
  return (
    <main className="text-neutral-700 leading-relaxed antialiased">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}

      <section className="bg-neutral-900 text-white px-6 py-20 md:py-28">
        <div className="max-w-4xl mx-auto space-y-6">
          <SectionLabel>Guía · Huipiles de Guatemala</SectionLabel>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white max-w-3xl">
            Huipiles de Guatemala: significado, origen y estilos
          </h1>
          <p className="text-lg text-neutral-300 max-w-2xl leading-relaxed">
            El huipil es la prenda más reconocida del traje típico femenino
            guatemalteco. Es una blusa tejida a mano cuyos colores, patrones y
            bordados varían según la comunidad de quien lo porta — y que lleva
            siglos funcionando como un sistema de identificación cultural visible.
          </p>
          <p className="text-base text-neutral-400 max-w-xl leading-relaxed">
            Esta página explica qué es un huipil, qué significan sus diseños,
            cómo se elabora y qué diferencia a los huipiles de distintas regiones
            de Guatemala.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <a
              href="/textiles-guatemala"
              className="inline-block bg-white text-neutral-900 font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm"
            >
              Ver guía completa de textiles
            </a>
            <a
              href="#significado"
              className="inline-block border border-white/40 text-white font-medium px-7 py-3.5 rounded-lg hover:border-white/70 hover:bg-white/10 transition-colors text-sm backdrop-blur-sm"
            >
              Explorar su significado
            </a>
          </div>
        </div>
      </section>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}

      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

        {/* ── SECTION 1 — ¿Qué es un huipil? ──────────────────────────────── */}

        <section aria-labelledby="que-es-heading">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>1 · Definición</SectionLabel>
              <h2
                id="que-es-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                ¿Qué es un huipil?
              </h2>
            </div>

            <p>
              El huipil es una prenda de vestir femenina de origen prehispánico
              que consiste en una tela rectangular o cuadrada con una abertura
              para la cabeza y, en algunos estilos, costuras laterales parciales
              para los brazos. Se usa como blusa o camisa y forma la parte
              superior del traje típico guatemalteco.
            </p>
            <p>
              A diferencia de las prendas de confección industrial, el huipil no
              tiene una forma fija que se adapta al cuerpo mediante cortes y
              costuras. Su forma es deliberadamente simple — es el tejido y el
              bordado lo que concentra toda la complejidad de la pieza.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              ¿Quién lo usa?
            </h3>
            <p>
              Principalmente mujeres indígenas guatemaltecas, aunque en algunas
              comunidades también se usa en versiones ceremoniales para hombres o
              en figuras religiosas. En muchas comunidades del altiplano, el uso
              del huipil no es una elección ocasional — es parte del vestuario
              cotidiano y una expresión de identidad.
            </p>
            <p>
              También existe el <strong className="text-neutral-900">huipil ceremonial</strong> o de gala, una versión más
              elaborada que se reserva para celebraciones, festividades y
              ocasiones especiales. Estos pueden requerir semanas o meses de
              trabajo y concentran los diseños más complejos de la tradición
              local.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              Uso cotidiano frente a uso ceremonial
            </h3>
            <p>
              En la práctica, muchas mujeres tienen al menos dos tipos de huipil:
              uno de uso diario, elaborado con materiales accesibles y diseños
              más simples, y uno de gala que se guarda para ocasiones
              importantes. La distinción no es solo estética — implica también
              diferencias en técnica, tiempo de elaboración y valor cultural.
            </p>

            <Callout label="Contexto importante">
              <p>
                El huipil tiene raíces que se remontan a las culturas
                mesoamericanas precolombinas. Su continuidad hasta el presente —
                después de siglos de presiones culturales y económicas — es en sí
                misma una expresión de resistencia cultural activa.
              </p>
            </Callout>
          </div>

          <div className="relative w-full h-72 md:h-[480px] my-12 rounded-2xl overflow-hidden">
            <Image
              src="/huipiles-guatemala/ChatGPT%20Image%2025%20mars%202026%2C%2011%20h%2046%20min%2021%20s.png"
              alt="Mujer guatemalteca portando huipil tradicional de colores vivos en mercado del altiplano"
              fill
              className="object-cover object-top"
            />
          </div>
        </section>

        {/* ── SECTION 2 — Significado ──────────────────────────────────────── */}

        <section id="significado" aria-labelledby="significado-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>2 · Significado</SectionLabel>
              <h2
                id="significado-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                El significado del huipil: identidad, símbolo y pertenencia
              </h2>
            </div>

            <p>
              Un huipil no es solo ropa. En muchas comunidades guatemaltecas, los
              patrones que lleva una prenda comunican información específica: de
              dónde es quien la usa, a qué comunidad pertenece, y en algunos
              casos su estado civil o su posición dentro de la vida comunitaria.
            </p>
            <p>
              Esta función comunicativa no es figurada — es literal. Una persona
              familiarizada con los textiles de distintas regiones puede
              identificar el origen de un huipil con relativa precisión solo a
              partir de sus colores y patrones.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              Los símbolos en el tejido
            </h3>
            <p>
              Los diseños del huipil incluyen con frecuencia figuras geométricas,
              animales, plantas y formas abstractas que tienen tradiciones de
              interpretación dentro de cada comunidad. Quetzales, serpientes,
              flores, estrellas y cruces son motivos que aparecen en distintas
              variaciones regionales.
            </p>
            <p>
              Sin embargo, es importante señalar que el significado exacto de
              cada símbolo varía según la comunidad y la tradición oral local. No
              existe un diccionario universal de símbolos para los textiles
              guatemaltecos — cada región tiene su propio lenguaje visual.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              Identidad cultural viva
            </h3>
            <p>
              Para muchas mujeres que usan huipil, la prenda no es un marcador
              de tradición pasada — es una afirmación de identidad presente. El
              acto de tejer, de transmitir patrones a las hijas, de usar el traje
              en espacios públicos es, en muchos contextos, también un acto
              político y cultural.
            </p>
            <p className="text-neutral-500 italic text-sm">
              En décadas recientes ha surgido también un movimiento de diseñadores
              guatemaltecos que reinterpretan los patrones del huipil en
              propuestas contemporáneas — una conversación entre tradición y
              presente que continúa evolucionando.
            </p>
          </div>

          <div className="relative w-full h-64 md:h-96 my-12 rounded-2xl overflow-hidden">
            <Image
              src="/huipiles-guatemala/ChatGPT%20Image%2025%20mars%202026%2C%2011%20h%2046%20min%2026%20s.png"
              alt="Detalle de bordado en huipil guatemalteco — figuras de animales y motivos geométricos en hilo multicolor"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* ── SECTION 3 — Elaboración ──────────────────────────────────────── */}

        <section aria-labelledby="elaboracion-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>3 · Elaboración</SectionLabel>
              <h2
                id="elaboracion-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Cómo se hace un huipil
              </h2>
            </div>

            <p>
              La elaboración de un huipil puede implicar una o más técnicas según
              la región y la tradición local. El proceso varía, pero en la mayoría
              de los casos involucra al menos dos fases: el tejido de la tela base
              y la decoración mediante bordado o el tejido directo de figuras en
              el telar.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              El hilo
            </h3>
            <p>
              Tradicionalmente se usa hilo de algodón, que puede ser natural o
              teñido con colorantes naturales como el añil (azul), la cochinilla
              (rojo) o plantas locales. En la producción contemporánea, muchos
              talleres y artesanas trabajan con hilos de colores industriales que
              amplían la paleta disponible y reducen el tiempo de preparación.
            </p>
            <p>
              La selección del hilo no es solo funcional — el grosor, la torsión
              y el acabado del hilo afectan directamente la textura y el drape
              final de la prenda.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              El tejido en telar de cintura
            </h3>
            <p>
              La mayoría de los huipiles tradicionales se tejen en{" "}
              <strong className="text-neutral-900">telar de cintura</strong> —
              también llamado telar de palitos o backstrap loom. Es un instrumento
              portátil: un extremo se ancla a un árbol o poste y el otro se sujeta
              alrededor de la cintura de quien teje, quien controla la tensión de
              la urdimbre con el movimiento de su propio cuerpo.
            </p>
            <p>
              Esta técnica permite una precisión notable en la colocación de
              hilos de color para crear figuras dentro del tejido, sin necesidad
              de bordado posterior. Es un proceso lento — una artesana
              experimentada puede tardar semanas en terminar un huipil complejo —
              y el resultado tiene una textura y una variación leve que no puede
              replicarse con maquinaria.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-2">
              El bordado
            </h3>
            <p>
              En algunos estilos regionales, los diseños no se tejen directamente
              sino que se bordan sobre la tela ya tejida. El bordado puede
              realizarse con aguja e hilo sobre tela de algodón producida en
              telar o incluso sobre telas industriales. Esta variante permite
              mayor libertad en el diseño pero implica un proceso técnico
              diferente al tejido integrado.
            </p>
            <p>
              En la práctica, muchos huipiles combinan ambas técnicas: una base
              tejida con figuras integradas en el telar y detalles adicionales
              bordados a mano en cuello, mangas o cenefas.
            </p>

            <Callout label="Nota técnica">
              <p>
                Un huipil complejo puede llegar a tener miles de cruces de hilo
                individuales en su diseño. Quienes los elaboran aprenden los
                patrones desde pequeñas — en muchos casos no a partir de un
                diseño escrito, sino de memoria y observación directa de piezas
                anteriores.
              </p>
            </Callout>
          </div>

          <div className="relative w-full h-72 md:h-[480px] my-12 rounded-2xl overflow-hidden">
            <Image
              src="/huipiles-guatemala/ChatGPT%20Image%2025%20mars%202026%2C%2011%20h%2046%20min%2033%20s.png"
              alt="Manos de artesana guatemalteca tejiendo en telar de cintura — detalle del proceso de elaboración del huipil"
              fill
              className="object-cover object-top"
            />
          </div>
        </section>

        {/* ── SECTION 4 — Regiones ─────────────────────────────────────────── */}

        <section aria-labelledby="regiones-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>4 · Regiones</SectionLabel>
              <h2
                id="regiones-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Huipiles por región: diferencias visuales y técnicas
              </h2>
            </div>

            <p>
              Uno de los aspectos más llamativos de los huipiles guatemaltecos es
              que no existe un estilo único. Cada comunidad desarrolló su propia
              tradición visual, y las diferencias entre regiones pueden ser tan
              marcadas que dos huipiles del mismo país parecen provenir de mundos
              distintos.
            </p>
          </div>

          <div className="max-w-3xl mt-10 space-y-10">

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-neutral-900">
                Nebaj — región ixil, Quiché
              </h3>
              <p>
                Los huipiles de Nebaj son reconocidos por sus colores intensos —
                predominantemente rojo, amarillo y verde — y por la densidad de
                sus figuras geométricas. Se tejen en telar de cintura y los
                diseños se integran directamente en el tejido, sin bordado
                posterior en la mayor parte de la pieza.
              </p>
              <p>
                Dentro de la tradición ixil, los patrones del huipil comunican
                pertenencia a Nebaj, Chajul o Cotzal — los tres municipios del
                área — con variaciones específicas para cada uno. El rojo intenso
                es el color más característico de esta región.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Santiago Atitlán — lago Atitlán, Sololá
              </h3>
              <p>
                Los huipiles de Santiago Atitlán son conocidos por sus franjas
                horizontales de colores y por la figura del quetzal y otras aves
                estilizadas que aparecen en su tejido. La paleta es variada y
                suele incluir púrpura, rojo, amarillo y verde sobre fondo blanco
                o crema.
              </p>
              <p>
                En Santiago, las mujeres también usan una cinta de tela enrollada
                en la cabeza — el <em>tocoyal</em> — que forma parte integral del
                traje y que varía en color y diseño según la comunidad.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                San Juan La Laguna — lago Atitlán, Sololá
              </h3>
              <p>
                San Juan La Laguna ha desarrollado en las últimas décadas una
                producción textil orientada también a mercados externos, con
                piezas que combinan técnicas tradicionales con diseños que
                incorporan elementos contemporáneos. Sus huipiles suelen usar
                tintes naturales — especialmente de plantas locales — y son
                reconocibles por sus tonos más cálidos y terrosos comparados con
                los de otros municipios del lago.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Cobán — Alta Verapaz
              </h3>
              <p>
                Los huipiles de Cobán pertenecen a la tradición q&rsquo;eqchi&rsquo; y se
                distinguen por el uso de tela blanca o crema con bordados en hilo
                negro o azul oscuro, frecuentemente con figuras florales. El
                contraste entre el fondo claro y los bordados oscuros produce una
                estética reconocible y diferente a la mayoría de los textiles del
                altiplano occidental.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Otras regiones
              </h3>
              <p>
                Chichicastenango, Sololá, San Marcos, Huehuetenango y decenas de
                municipios más tienen tradiciones propias de huipil. La diversidad
                es tal que un catálogo completo de estilos regionales cubriría
                cientos de variaciones. Lo que comparten es el formato básico de
                la prenda — lo que los diferencia es todo lo demás.
              </p>
              <p className="text-neutral-500 text-sm italic">
                Si ves un huipil y no puedes identificar su región de origen, no
                es un fallo de conocimiento — es una señal de la escala de esa
                diversidad.
              </p>
            </div>

          </div>

          <div className="relative w-full h-80 md:h-[500px] my-12 rounded-2xl overflow-hidden">
            <Image
              src="/huipiles-guatemala/ChatGPT%20Image%2025%20mars%202026%2C%2011%20h%2046%20min%2036%20s.png"
              alt="Huipiles de distintas regiones de Guatemala expuestos en mercado — variedad de colores, patrones y estilos regionales"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* ── SECTION 5 — Variante lingüística ─────────────────────────────── */}

        <section aria-labelledby="variante-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>5 · Nota lingüística</SectionLabel>
              <h2
                id="variante-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Huipil o güipil: ¿cómo se escribe correctamente?
              </h2>
            </div>

            <p>
              Quienes buscan información sobre esta prenda encuentran con
              frecuencia dos formas de escritura: &ldquo;huipil&rdquo; y
              &ldquo;güipil&rdquo;. Ambas se usan en Guatemala y Centroamérica
              para referirse a la misma prenda — la diferencia es ortográfica,
              no de significado.
            </p>

            <Callout label="Dato curioso">
              <p>
                La prenda conocida como &ldquo;huipil&rdquo; también puede
                encontrarse escrita como &ldquo;güipil&rdquo; en algunos
                contextos de Guatemala y Centroamérica.
              </p>
              <p>
                Ambas formas se refieren a la misma prenda tradicional.
                &ldquo;Huipil&rdquo; es la forma más estandarizada en español,
                mientras que &ldquo;güipil&rdquo; refleja una adaptación más
                cercana a su pronunciación en el habla cotidiana.
              </p>
              <p>
                En Flowjuyu utilizamos principalmente &ldquo;huipil&rdquo; para
                mantener claridad, pero reconocer ambas formas es parte de
                entender la riqueza lingüística y cultural que rodea estos
                textiles.
              </p>
            </Callout>

            <p>
              El origen de la palabra es náhuatl:{" "}
              <em>huīpīlli</em>, que se refería a esta prenda entre los pueblos
              mesoamericanos antes de la llegada europea. La forma &ldquo;güipil&rdquo;
              surge de una adaptación fonética al español guatemalteco, donde la
              &ldquo;h&rdquo; inicial muda se reemplaza por &ldquo;gü&rdquo; para
              representar mejor la pronunciación popular.
            </p>
            <p>
              Desde el punto de vista del SEO y la búsqueda en internet, las dos
              formas generan tráfico. Quien busca &ldquo;güipil&rdquo; y quien
              busca &ldquo;huipil&rdquo; está buscando lo mismo — razón por la
              que es útil reconocer ambas.
            </p>
          </div>
        </section>

        {/* ── SECTION 6 — Flowjuyu ─────────────────────────────────────────── */}

        <section aria-labelledby="flowjuyu-heading">
          <div className="bg-neutral-50 rounded-2xl px-8 py-12 md:px-14 md:py-16 space-y-6">
            <div>
              <SectionLabel>6 · Flowjuyu</SectionLabel>
              <h2
                id="flowjuyu-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Flowjuyu y los textiles guatemaltecos
              </h2>
            </div>

            <div className="max-w-2xl space-y-5">
              <p>
                Los huipiles guatemaltecos llegan con frecuencia a compradores
                fuera del país sin contexto: sin saber de qué región provienen,
                qué técnica se usó para elaborarlos ni qué comunidad está detrás
                del diseño. Esa falta de información no es neutral — afecta el
                valor que se le asigna a la pieza y el precio que recibe quien
                la produjo.
              </p>
              <p>
                Flowjuyu es una plataforma guatemalteca que trabaja con artesanos
                y vendedores del altiplano para que esa información esté
                disponible. No es una garantía de perfección — es un compromiso
                con la transparencia.
              </p>
            </div>

            <ul className="max-w-2xl space-y-4 pt-2">
              {[
                {
                  label: "Origen documentado.",
                  text: "Indicamos de qué región proviene cada pieza y, cuando es posible, qué artesana o taller la elaboró.",
                },
                {
                  label: "Técnica visible.",
                  text: "Describimos si el huipil fue tejido en telar de cintura, bordado, o elaborado con una combinación de técnicas.",
                },
                {
                  label: "Contexto cultural.",
                  text: "Cada pieza va acompañada de información sobre su región y tradición, no solo de una descripción de producto.",
                },
                {
                  label: "Precio justo en la cadena.",
                  text: "Buscamos reducir intermediarios innecesarios para que el valor de la pieza llegue a quien la hizo.",
                },
              ].map(({ label, text }) => (
                <li key={label} className="flex gap-3 items-start">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-neutral-900 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="leading-relaxed text-sm">
                    <strong className="text-neutral-900">{label}</strong>{" "}
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden mt-6">
              <Image
                src="/huipiles-guatemala/ChatGPT%20Image%2025%20mars%202026%2C%2011%20h%2046%20min%2039%20s.png"
                alt="Artesana guatemalteca presentando huipil bordado en su taller — piezas disponibles en Flowjuyu"
                fill
                className="object-cover object-top"
              />
            </div>

            <div className="max-w-2xl pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="/textiles-guatemala"
                className="inline-block bg-neutral-900 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors text-sm"
              >
                Ver guía de textiles
              </a>
              <a
                href="/vender"
                className="inline-block border border-neutral-300 text-neutral-700 font-medium px-7 py-3.5 rounded-lg hover:border-neutral-500 transition-colors text-sm"
              >
                Vender en Flowjuyu
              </a>
            </div>
          </div>
        </section>

        {/* ── INTERNAL LINKS ───────────────────────────────────────────────── */}

        <section aria-labelledby="ver-mas-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <h2
              id="ver-mas-heading"
              className="text-xl font-bold text-neutral-900"
            >
              Más sobre textiles guatemaltecos
            </h2>
            <ul className="space-y-3">
              {[
                {
                  href: "/textiles-guatemala",
                  label: "Textiles de Guatemala",
                  desc: "Guía completa: cortes, huipiles, fajas y regiones productoras.",
                },
                {
                  href: "/cortes-salcaja",
                  label: "Cortes de Salcajá",
                  desc: "El proceso del jaspeado y la tradición textil de Salcajá, Quetzaltenango.",
                },
              ].map(({ href, label, desc }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-neutral-200 hover:border-neutral-400 transition-colors"
                  >
                    <span className="text-neutral-400 mt-0.5 group-hover:text-neutral-600 transition-colors">
                      →
                    </span>
                    <span>
                      <span className="font-semibold text-neutral-900 block text-sm">
                        {label}
                      </span>
                      <span className="text-neutral-500 text-sm">{desc}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FOOTER NOTE ──────────────────────────────────────────────────── */}

        <footer className="border-t border-neutral-200 pt-10">
          <p className="text-xs text-neutral-400 leading-loose max-w-2xl">
            Esta página reúne información educativa y de referencia sobre los
            huipiles guatemaltecos. El contenido está basado en conocimiento
            documentado sobre las tradiciones textiles mayas y del altiplano
            guatemalteco. Si eres artesana o vendedor y quieres publicar tus
            piezas en Flowjuyu,{" "}
            <a
              href="/vender"
              className="underline underline-offset-2 hover:text-neutral-700 transition-colors"
            >
              puedes registrarte desde nuestra plataforma
            </a>
            .
          </p>
        </footer>

      </div>
    </main>
  );
}
