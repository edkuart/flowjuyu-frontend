import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { LEGAL_TERMS_VERSION } from "@/lib/legal";

export default function LegalTermsPage() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      summary="Estos términos regulan el uso de Flowjuyu como plataforma para descubrir artesanías, crear tiendas y conectar compradores con vendedores. Este es el draft operativo vigente para la versión actual del producto."
      updatedAt={`Abril 2026 · ${LEGAL_TERMS_VERSION}`}
    >
      <section>
        <h2 className="font-serif text-2xl text-neutral-900">1. Qué es Flowjuyu</h2>
        <p className="mt-3">
          Flowjuyu es un marketplace digital donde artesanos y vendedores pueden crear
          una tienda, publicar productos y recibir contactos de compradores.
        </p>
        <p className="mt-3">
          Flowjuyu facilita visibilidad, herramientas de publicación y canales de
          contacto. Salvo cuando se indique expresamente lo contrario, no actúa como
          fabricante ni como vendedor directo de los productos publicados.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">2. Cuentas y acceso</h2>
        <p className="mt-3">
          Para usar ciertas funciones debes crear una cuenta con datos reales y mantener
          tus credenciales seguras. Eres responsable de la actividad realizada desde tu
          cuenta.
        </p>
        <p className="mt-3">
          Flowjuyu puede suspender o limitar cuentas cuando detecte fraude, suplantación,
          uso abusivo o incumplimiento de estas reglas.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">3. Reglas para vendedores</h2>
        <p className="mt-3">
          Los vendedores son responsables de la información que publican sobre su tienda
          y sus productos, incluyendo nombre comercial, precios, imágenes,
          disponibilidad, descripciones y datos de contacto.
        </p>
        <p className="mt-3">
          Los vendedores también declaran que cuentan con los derechos necesarios sobre
          las imágenes, textos y demás contenido que suben a la plataforma.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">4. Contacto con vendedores</h2>
        <p className="mt-3">
          Flowjuyu puede facilitar el contacto entre compradores y vendedores mediante
          herramientas dentro de la plataforma o mediante canales externos como
          WhatsApp.
        </p>
        <p className="mt-3">
          Cuando la conversación continúe fuera de Flowjuyu, esa comunicación ocurre en
          un entorno externo y ambas partes deben usarla de forma lícita, respetuosa y
          sin spam.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">5. Productos y contenido no permitidos</h2>
        <p className="mt-3">
          No se permite publicar contenido falso, engañoso, ilegal, ofensivo o que
          infrinja derechos de terceros. Flowjuyu también puede retirar productos o
          perfiles que generen riesgo para usuarios o para la operación de la
          plataforma.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">6. Rol y límites de Flowjuyu</h2>
        <p className="mt-3">
          Flowjuyu actúa como plataforma intermediaria. La calidad, entrega,
          disponibilidad, legalidad y condiciones de cada producto corresponden al
          vendedor que lo publica, salvo que Flowjuyu asuma expresamente una obligación
          específica.
        </p>
        <p className="mt-3">
          Flowjuyu adopta medidas razonables para operar la plataforma y atender
          reportes, pero no puede garantizar disponibilidad ininterrumpida ni ausencia
          absoluta de errores.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">7. Propiedad intelectual</h2>
        <p className="mt-3">
          La marca, diseño, software y estructura de Flowjuyu pertenecen a Flowjuyu o a
          sus licenciantes. El contenido subido por vendedores sigue siendo de sus
          titulares, pero autorizan su uso dentro de la plataforma para operar la tienda
          y promocionar sus productos dentro del servicio.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">8. Cambios y contacto</h2>
        <p className="mt-3">
          Flowjuyu puede actualizar estos términos para reflejar cambios del producto,
          mejoras operativas o ajustes legales. La versión vigente será la publicada en
          esta página.
        </p>
        <p className="mt-3">
          Si tienes dudas sobre estos términos, puedes escribir a
          {" "}
          <a className="font-medium text-[#0f3d3a] hover:underline" href="mailto:contacto@flowjuyu.com">
            contacto@flowjuyu.com
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
