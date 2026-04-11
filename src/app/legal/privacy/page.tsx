import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export default function LegalPrivacyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      summary="Este espacio resume cómo Flowjuyu recopila, usa y protege datos personales para operar la plataforma. Por ahora funciona como base pública mientras completamos la versión final."
      updatedAt="Abril 2026"
    >
      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Qué datos usamos</h2>
        <p className="mt-3">
          Flowjuyu puede recopilar datos de cuenta como nombre, teléfono, correo
          electrónico, información de tienda y actividad dentro de la plataforma.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Para qué los usamos</h2>
        <p className="mt-3">
          Usamos estos datos para crear cuentas, operar tiendas, facilitar contacto
          entre compradores y vendedores, enviar mensajes operativos, mejorar el
          servicio y prevenir abuso.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Canales y terceros operativos</h2>
        <p className="mt-3">
          Algunas interacciones pueden apoyarse en proveedores técnicos de hosting,
          email y mensajería. Cuando se usa WhatsApp para contactar a un vendedor, esa
          conversación ocurre fuera de Flowjuyu.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Estado actual</h2>
        <p className="mt-3">
          Esta página es un placeholder público y será reemplazada por una política de
          privacidad completa alineada con la operación final del marketplace.
        </p>
      </section>
    </LegalPageLayout>
  );
}
