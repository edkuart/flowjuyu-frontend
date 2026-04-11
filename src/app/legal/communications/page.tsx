import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export default function LegalCommunicationsPage() {
  return (
    <LegalPageLayout
      title="Política de Comunicaciones"
      summary="Aquí explicamos la base de los mensajes operativos que Flowjuyu puede enviar por email y, cuando corresponda, por WhatsApp."
      updatedAt="Abril 2026"
    >
      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Mensajes operativos</h2>
        <p className="mt-3">
          Flowjuyu puede enviar correos relacionados con registro, seguridad de cuenta,
          activación, onboarding, soporte y funcionamiento normal de la plataforma.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">WhatsApp</h2>
        <p className="mt-3">
          Cuando uses el contacto por WhatsApp, la conversación se realizará fuera de
          Flowjuyu. El objetivo es facilitar una comunicación directa entre comprador y
          vendedor.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl text-neutral-900">Estado actual</h2>
        <p className="mt-3">
          Esta política es una base mínima funcional. Flowjuyu publicará una versión más
          completa cuando active nuevos flujos de comunicación.
        </p>
      </section>
    </LegalPageLayout>
  );
}
