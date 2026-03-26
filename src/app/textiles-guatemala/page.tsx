import type { Metadata } from "next";
import Image from "next/image";

// ── SEO Metadata ───────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Textiles de Guatemala: tradición, tipos y significado | Flowjuyu",
  description:
    "Guía completa sobre los textiles de Guatemala: qué son los cortes, huipiles y fajas, cómo se elaboran, qué regiones los producen y por qué siguen siendo parte viva de la cultura guatemalteca.",
  openGraph: {
    title: "Textiles de Guatemala: tradición, tipos y significado",
    description:
      "Conoce los principales textiles de Guatemala — cortes, huipiles, fajas — su proceso de elaboración, regiones productoras y significado cultural.",
    url: "https://flowjuyu.com/textiles-guatemala",
    type: "article",
    images: [
      {
        url: "https://flowjuyu.com/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2047%20min%2055%20s.png",
        width: 1200,
        height: 800,
        alt: "Textiles tradicionales de Guatemala — cortes, huipiles y fajas",
      },
    ],
  },
  alternates: {
    canonical: "https://flowjuyu.com/textiles-guatemala",
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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TextilesGuatemalaPage() {
  return (
    <main className="text-neutral-700 leading-relaxed antialiased">

      {/* ── HERO ───────────────────────────────────────────────────────────── */}

      <section className="relative min-h-[65vh] flex items-center">

        {/* Background image */}
        <Image
          src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2047%20min%2055%20s.png"
          alt="Textiles tradicionales de Guatemala — cortes, huipiles y fajas en colores vivos"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/30" />

        {/* Content layer */}
        <div className="relative z-10 w-full px-6 pt-24 pb-24">
          <div className="max-w-4xl mx-auto space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-300">
              Guía · Textiles de Guatemala
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white max-w-3xl">
              Textiles de Guatemala: tradición, tipos y significado
            </h1>
            <p className="text-lg text-neutral-200 max-w-2xl leading-relaxed">
              Guatemala tiene una de las tradiciones textiles más diversas de
              América Latina. Los cortes, huipiles y fajas que se producen en el
              país no son solo prendas — son objetos que comunican identidad,
              pertenencia y origen. Esta página explica qué son, cómo se elaboran
              y por qué importan.
            </p>
            <p className="text-base text-neutral-400 max-w-xl leading-relaxed">
              Lo que distingue a los textiles guatemaltecos de cualquier otro
              tejido del mundo no es una característica técnica aislada — es que
              el diseño, el color y la forma en que se usa una pieza forman un
              sistema de comunicación visual que lleva siglos en funcionamiento.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="/categorias/cortes"
                className="inline-block bg-white text-neutral-900 font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-100 transition-colors text-sm"
              >
                Ver textiles disponibles
              </a>
              <a
                href="#tipos"
                className="inline-block border border-white/40 text-white font-medium px-7 py-3.5 rounded-lg hover:border-white/70 hover:bg-white/10 transition-colors text-sm backdrop-blur-sm"
              >
                Explorar tipos
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}

      <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">

        {/* ── SECTION 1 — Qué son ──────────────────────────────────────────── */}

        <section aria-labelledby="que-son-heading">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>1 · Definición</SectionLabel>
              <h2
                id="que-son-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                ¿Qué son los textiles de Guatemala?
              </h2>
            </div>

            <p>
              Los textiles de Guatemala son telas elaboradas mediante técnicas
              de tejido — generalmente a mano o con apoyo de telares — que
              forman parte del vestuario tradicional de las comunidades indígenas
              del país, en su mayoría de origen maya.
            </p>
            <p>
              A diferencia de la ropa producida en serie, estos textiles tienen
              un alto componente cultural. Los colores, patrones y técnicas de
              cada pieza varían según la región, la comunidad y en algunos casos
              la persona que los usa. Un huipil de Nebaj, por ejemplo, no se
              parece a uno de Santiago Atitlán — y esa diferencia es intencional.
            </p>
            <p>
              En muchas comunidades, el uso del traje típico no es opcional ni
              decorativo. Es una forma de expresar pertenencia, transmitir
              historia y mantener viva una práctica que lleva siglos.
            </p>

            <div className="bg-neutral-50 border-l-4 border-neutral-300 pl-5 pr-4 py-4 rounded-r-lg">
              <p className="text-neutral-600 text-sm leading-loose italic">
                Los textiles guatemaltecos fueron reconocidos por la UNESCO como
                parte del Patrimonio Cultural Inmaterial de la Humanidad, en
                reconocimiento a su valor cultural y a las comunidades que los
                preservan.
              </p>
            </div>

            <p>
              Más allá del uso personal, los textiles representan una fuente
              importante de ingresos para miles de familias artesanas en el
              altiplano y otras regiones del país. Su producción y
              comercialización es parte central de la economía local en muchos
              municipios.
            </p>
          </div>

          <Image
            src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2047%20min%2058%20s.png"
            alt="Traje típico guatemalteco completo — corte, huipil y faja — mostrando la diversidad de patrones y colores por región"
            width={1200}
            height={800}
            className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
          />
        </section>

        {/* ── SECTION 2 — Tipos ────────────────────────────────────────────── */}

        <section id="tipos" aria-labelledby="tipos-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>2 · Tipos</SectionLabel>
              <h2
                id="tipos-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Principales tipos de textiles guatemaltecos
              </h2>
            </div>

            <p>
              Aunque existen muchas variaciones regionales, los textiles
              guatemaltecos se pueden organizar en algunas categorías
              principales. Cada una tiene una función específica dentro del
              vestuario tradicional.
            </p>
          </div>

          <div className="max-w-3xl mt-10 space-y-10">

            {/* Corte */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-neutral-900">
                El corte
              </h3>
              <p>
                El corte es la tela que se usa como falda envuelta en el traje
                femenino. Se trata de una pieza larga — entre 7 y 11 varas
                aproximadamente — que no se recibe como prenda terminada sino
                como tela en bruto. La mujer la dobla, la faja y la ajusta según
                su tradición.
              </p>
              <p>
                Los cortes de Salcajá son especialmente conocidos por su técnica
                de{" "}
                <strong className="text-neutral-900">jaspeado</strong>: un
                proceso en el que el diseño se crea amarrando partes del hilo
                antes de teñirlo, produciendo el efecto difuminado característico
                de estas telas.
              </p>
              <p className="text-neutral-500 text-sm italic">
                Lo que distingue a un corte jaspeado de cualquier otra tela es
                que su diseño existe antes de ser tejido — está escrito en el
                hilo desde el principio.
              </p>
              <a
                href="/cortes-salcaja"
                className="inline-block text-sm text-neutral-900 underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Leer más sobre los cortes de Salcajá →
              </a>
              <div className="pt-4">
                <Image
                  src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2000%20s.png"
                  alt="Corte guatemalteco jaspeado extendido mostrando el patrón difuminado característico del tejido de Salcajá"
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
                />
              </div>
            </div>

            {/* Huipil */}
            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                El huipil
              </h3>
              <p>
                El huipil es la blusa o camisa del traje típico femenino. Es,
                posiblemente, la prenda más identificada con la identidad
                indígena guatemalteca. Se elabora en telar de cintura y suele
                estar decorado con figuras geométricas, animales, flores o
                símbolos que tienen significado específico dentro de cada
                comunidad.
              </p>
              <p>
                Los diseños varían radicalmente de un municipio a otro. El
                huipil de Chichicastenango usa colores y bordados distintos al de
                San Marcos La Laguna, y ambos son diferentes al de Cobán. Esta
                diversidad es parte de lo que hace únicos a los textiles
                guatemaltecos como sistema cultural.
              </p>
              <p className="text-neutral-500 text-sm italic">
                Identificar el origen de un huipil por sus patrones no es
                folklore — es un sistema de lectura que las comunidades han
                mantenido activo durante generaciones.
              </p>
              <div className="bg-neutral-50 border-l-4 border-neutral-300 pl-5 pr-4 py-4 rounded-r-lg">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">
                  Dato curioso
                </span>
                <p className="text-neutral-600 text-sm leading-loose mb-3">
                  La prenda conocida como &ldquo;huipil&rdquo; también puede
                  encontrarse escrita como &ldquo;güipil&rdquo; en algunos
                  contextos de Guatemala y Centroamérica.
                </p>
                <p className="text-neutral-600 text-sm leading-loose mb-3">
                  Ambas formas se refieren a la misma prenda tradicional.
                  &ldquo;Huipil&rdquo; es la forma más estandarizada en
                  español, mientras que &ldquo;güipil&rdquo; refleja una
                  adaptación más cercana a su pronunciación en el habla
                  cotidiana.
                </p>
                <p className="text-neutral-600 text-sm leading-loose">
                  En Flowjuyu utilizamos principalmente &ldquo;huipil&rdquo;
                  para mantener claridad, pero reconocer ambas formas es parte
                  de entender la riqueza lingüística y cultural que rodea estos
                  textiles.
                </p>
              </div>
              <div className="pt-4">
                <Image
                  src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2003%20s.png"
                  alt="Huipil guatemalteco con bordados geométricos tradicionales, mostrando los patrones y colores característicos de su región de origen"
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
                />
              </div>
            </div>

            {/* Faja */}
            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                La faja
              </h3>
              <p>
                La faja es una tira larga de tela tejida que se enrolla alrededor
                de la cintura para sujetar el corte. Aunque es una pieza
                funcional, también tiene valor decorativo y puede incluir
                patrones complejos tejidos con técnicas de backstrap o telar de
                cintura.
              </p>
              <p>
                En algunas comunidades, el diseño de la faja está tan codificado
                como el del huipil y puede identificar la procedencia de quien la
                usa.
              </p>
              <p className="text-neutral-500 text-sm italic">
                Es la pieza que con mayor frecuencia pasa desapercibida para
                quien no conoce el traje — y una de las que más información
                cultural concentra.
              </p>
              <div className="pt-4">
                <Image
                  src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2006%20s.png"
                  alt="Faja guatemalteca tejida con patrones geométricos en colores vivos, pieza tradicional del traje típico femenino"
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
                />
              </div>
            </div>

            {/* Otros */}
            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Otros textiles
              </h3>
              <p>
                Además del corte, el huipil y la faja, la tradición textil
                guatemalteca incluye otras piezas como el{" "}
                <strong className="text-neutral-900">tzute</strong> (paño
                multiusos utilizado sobre la cabeza o el hombro), el{" "}
                <strong className="text-neutral-900">perraje</strong> (chal
                femenino) y distintos tipos de bolsas y artículos elaborados con
                las mismas técnicas.
              </p>
              <p className="text-neutral-500 text-sm italic">
                Cada una de estas piezas tiene sus propias variaciones
                regionales — lo que convierte al conjunto del textil guatemalteco
                en un archivo visual de una complejidad difícil de documentar
                completamente.
              </p>
              <div className="pt-4">
                <Image
                  src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2009%20s.png"
                  alt="Variedad de textiles guatemaltecos — tzute, perraje y bolsas artesanales — elaborados con las mismas técnicas del traje típico"
                  width={1200}
                  height={800}
                  className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── SECTION 3 — Regiones ─────────────────────────────────────────── */}

        <section aria-labelledby="regiones-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>3 · Regiones</SectionLabel>
              <h2
                id="regiones-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Regiones productoras de textiles en Guatemala
              </h2>
            </div>

            <p>
              La producción textil en Guatemala no está concentrada en un solo
              lugar, y esa dispersión no es un accidente — cada región desarrolló
              su propia tradición visual a lo largo de siglos, moldeada por su
              historia, sus materiales disponibles y su identidad comunitaria.
              Lo que tienen en común es la técnica de base; lo que las diferencia
              es todo lo demás.
            </p>
          </div>

          <div className="max-w-3xl mt-10 space-y-10">

            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-neutral-900">
                Salcajá — Quetzaltenango
              </h3>
              <p>
                Salcajá es uno de los municipios con mayor producción de cortes
                jaspeados en el país. Su técnica distintiva — el amarrado del
                hilo antes del teñido — produce telas con patrones difuminados
                que son reconocibles a simple vista. A diferencia de las regiones
                donde predomina el bordado sobre la tela ya tejida, en Salcajá
                el diseño se construye antes de que el telar entre en escena.
              </p>
              <p>
                En Salcajá coexisten talleres artesanales con métodos manuales y
                talleres con telares mecánicos. La producción es continua y
                abastece tanto mercados locales como compradores fuera de
                Guatemala.
              </p>
              <a
                href="/cortes-salcaja"
                className="inline-block text-sm text-neutral-900 underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                Ver página completa: Cortes de Salcajá →
              </a>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Nebaj — Quiché
              </h3>
              <p>
                Nebaj, en la región ixil del departamento de Quiché, es conocido
                por sus huipiles con patrones geométricos complejos en colores
                vivos — principalmente rojo, amarillo y verde. El tejido en telar
                de cintura sigue siendo la técnica predominante, y los diseños se
                trabajan directamente en el telar sin ninguna etapa previa de
                marcado o amarrado.
              </p>
              <p>
                Comparado con los textiles de Salcajá — donde el diseño surge del
                hilo antes del tejido — en Nebaj el patrón emerge del proceso de
                tejido mismo, cruzando hilos de colores con precisión milimétrica.
                Son tradiciones técnicamente distintas que producen resultados
                igualmente sofisticados.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Sololá y el lago Atitlán
              </h3>
              <p>
                La región del lago Atitlán concentra varios municipios con
                tradiciones textiles propias: San Juan La Laguna, Santiago
                Atitlán, San Antonio Palopó, entre otros. Lo llamativo de esta
                área es que municipios a pocos kilómetros de distancia producen
                piezas con identidades visuales completamente distintas, lo que
                convierte al lago en un muestrario comprimido de la diversidad
                textil guatemalteca.
              </p>
            </div>

            <div className="space-y-3 border-t border-neutral-100 pt-8">
              <h3 className="text-xl font-semibold text-neutral-900">
                Chichicastenango — Quiché
              </h3>
              <p>
                Chichicastenango es conocido internacionalmente como mercado de
                artesanías, pero tiene también una producción textil propia
                reconocible por sus bordados oscuros sobre fondo negro o rojo
                profundo — una paleta que contrasta con el colorido intenso de
                Nebaj o el Atitlán y que refleja una estética local diferenciada.
              </p>
            </div>

          </div>

          <Image
            src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2011%20s.png"
            alt="Muestras de textiles de distintas regiones de Guatemala — Salcajá, Nebaj, lago Atitlán y Chichicastenango — comparando técnicas y paletas de color"
            width={1200}
            height={800}
            className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
          />
        </section>

        {/* ── SECTION 4 — Elaboración ──────────────────────────────────────── */}

        <section aria-labelledby="elaboracion-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>4 · El proceso</SectionLabel>
              <h2
                id="elaboracion-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Cómo se elaboran los textiles guatemaltecos
              </h2>
            </div>

            <p>
              El proceso varía según la región, la técnica y el tipo de prenda.
              Sin embargo, la mayoría de los textiles tradicionales guatemaltecos
              comparten etapas similares de producción.
            </p>

            <div className="space-y-8 pt-2">

              <div className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                  1
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-900">
                    Selección y preparación del hilo
                  </h3>
                  <p className="text-sm leading-relaxed">
                    La mayoría de los textiles tradicionales se elaboran con hilo
                    de algodón, aunque en la producción contemporánea también se
                    usan mezclas con fibras sintéticas. El hilo se organiza antes
                    del teñido y el tejido.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                  2
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-900">
                    Teñido
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Históricamente se usaban tintes naturales como el añil y la
                    cochinilla. En la producción actual, muchos talleres trabajan
                    con tintes químicos industriales que permiten mayor
                    consistencia de color y menor tiempo de producción. Algunos
                    talleres combinan ambos métodos.
                  </p>
                  <p className="text-sm leading-relaxed">
                    En el caso del jaspeado — técnica característica de Salcajá —
                    el hilo se amarra en partes antes del teñido para crear el
                    diseño difuminado en la tela final.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                  3
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-900">
                    Tejido en telar
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Los textiles tradicionales se tejen en{" "}
                    <strong className="text-neutral-900">
                      telar de cintura
                    </strong>{" "}
                    — un instrumento portátil en el que la tensión del tejido la
                    proporciona el cuerpo del artesano — o en{" "}
                    <strong className="text-neutral-900">
                      telar de pie
                    </strong>
                    , una estructura más grande que permite mayor velocidad. En
                    Salcajá también se utilizan telares mecánicos para la
                    producción de cortes en mayor volumen.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center text-xs font-semibold mt-0.5">
                  4
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-neutral-900">
                    Acabado
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Una vez tejida la pieza, se revisa la tensión, se cortan los
                    hilos sueltos y se prepara para su uso o comercialización.
                    En el caso de los cortes, la tela se dobla en varas para su
                    venta.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <Image
            src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2014%20s.png"
            alt="Artesana guatemalteca trabajando en telar de cintura con hilo de colores, mostrando la técnica tradicional de tejido del altiplano"
            width={1200}
            height={800}
            className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
          />
        </section>

        {/* ── SECTION 5 — Por qué importan ─────────────────────────────────── */}

        <section aria-labelledby="importancia-heading" className="border-t border-neutral-200 pt-16">
          <div className="max-w-3xl space-y-6">
            <div>
              <SectionLabel>5 · Importancia</SectionLabel>
              <h2
                id="importancia-heading"
                className="text-2xl md:text-3xl font-bold text-neutral-900"
              >
                Por qué los textiles guatemaltecos siguen importando
              </h2>
            </div>

            <h3 className="text-lg font-semibold text-neutral-900">
              Identidad cultural
            </h3>
            <p>
              Los textiles guatemaltecos son uno de los soportes más visibles de
              la identidad indígena en el país. En muchas comunidades, el traje
              típico no es una práctica que pertenece al pasado — es parte de la
              vida cotidiana y de la forma en que las personas se presentan ante
              su comunidad y ante el mundo.
            </p>
            <p>
              Los diseños y patrones son en muchos casos un lenguaje visual que
              comunica pertenencia a un lugar, a una familia o a una generación.
              Ese conocimiento se transmite entre mujeres de generación en
              generación, y su pérdida implicaría la desaparición de información
              cultural que no está documentada en ningún otro soporte.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-4">
              Economía local
            </h3>
            <p>
              La producción textil es una fuente de ingresos fundamental para
              miles de familias en el altiplano guatemalteco. Municipios como
              Salcajá, Totonicapán y San Juan La Laguna tienen economías
              locales que dependen en parte significativa de la actividad
              textil.
            </p>
            <p>
              La comercialización de textiles — especialmente fuera de Guatemala
              — representa una oportunidad de ampliar esos ingresos. Sin embargo,
              cuando esa comercialización pasa por demasiados intermediarios, el
              valor económico no siempre llega a quien produjo la pieza.
            </p>

            <h3 className="text-lg font-semibold text-neutral-900 pt-4">
              Patrimonio vivo
            </h3>
            <p>
              A diferencia de los objetos de museo, los textiles guatemaltecos
              siguen siendo usados, producidos y transformados. Son un patrimonio
              activo. Las nuevas generaciones de artesanos incorporan nuevos
              diseños, nuevas técnicas y nuevos mercados — sin abandonar
              necesariamente las bases de su tradición.
            </p>
          </div>

          <Image
            src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2018%20s.png"
            alt="Mercado de textiles guatemaltecos con vendedoras en traje típico y telas extendidas, actividad comercial cotidiana en el altiplano"
            width={1200}
            height={800}
            className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
          />
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
                Flowjuyu: textiles guatemaltecos con origen conocido
              </h2>
            </div>

            <div className="max-w-2xl space-y-5">
              <p>
                Todo lo que está documentado en esta página — el proceso, las
                regiones, las técnicas — existe en un mercado que a menudo no lo
                comunica. Quien compra un corte fuera de Guatemala rara vez sabe
                de dónde viene, quién lo hizo o qué etapas implicó producirlo.
              </p>
              <p>
                Flowjuyu surgió de esa brecha. Es una plataforma guatemalteca
                enfocada en conectar directamente con artesanos y vendedores del
                altiplano — principalmente cortes de Salcajá y otras piezas
                textiles — con el objetivo de que el origen de cada pieza sea
                visible, no asumido.
              </p>
            </div>

            <ul className="max-w-2xl space-y-4 pt-2">
              {[
                {
                  label: "Origen visible.",
                  text: "Cada pieza tiene información sobre la región de procedencia y, cuando es posible, sobre quién la elaboró.",
                },
                {
                  label: "Proceso documentado.",
                  text: "Indicamos si la pieza fue tejida en telar manual o con apoyo mecánico, y qué tipo de tinte se utilizó cuando esa información está disponible.",
                },
                {
                  label: "Menos intermediarios.",
                  text: "La cadena entre artesano y comprador es más corta — lo que permite precios más justos en ambos sentidos.",
                },
                {
                  label: "Contexto antes de la compra.",
                  text: "No vendemos piezas sin explicación. Quien compra en Flowjuyu sabe qué tiene en sus manos.",
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

            <div className="max-w-2xl">
              <Image
                src="/textiles-guatemala/ChatGPT%20Image%2024%20mars%202026%2C%2023%20h%2048%20min%2021%20s.png"
                alt="Artesano guatemalteco con textiles tradicionales listos para comercializar, representando la conexión directa que ofrece Flowjuyu"
                width={1200}
                height={800}
                className="rounded-2xl shadow-sm w-full h-auto my-12 object-cover"
              />
            </div>

            <div className="max-w-2xl pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href="/categorias/cortes"
                className="inline-block bg-neutral-900 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-neutral-800 transition-colors text-sm"
              >
                Explorar textiles
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

        {/* ── FOOTER NOTE ──────────────────────────────────────────────────── */}

        <footer className="border-t border-neutral-200 pt-10">
          <p className="text-xs text-neutral-400 leading-loose max-w-2xl">
            Esta página reúne información general sobre los textiles
            guatemaltecos con fines educativos y de referencia. El contenido
            está basado en conocimiento documentado sobre las tradiciones
            textiles del altiplano guatemalteco. Si eres artesano o vendedor y
            quieres publicar tus piezas en Flowjuyu,{" "}
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
