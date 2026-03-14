// src/app/terminos/page.tsx

export default function TermsPage() {
  return (
    <main className="bg-[#f6f2ea] min-h-screen py-24">

      <div className="max-w-3xl mx-auto px-6 md:px-10">

        <h1 className="font-serif text-4xl md:text-5xl mb-10 text-neutral-900">
          Términos y Condiciones
        </h1>

        <div className="space-y-10 text-neutral-700 leading-relaxed text-[15px]">

          <p>
            Última actualización: Marzo 2026
          </p>

          <p>
            Bienvenido a <strong>Flowjuyu</strong>. Al utilizar esta
            plataforma aceptas los siguientes términos y condiciones
            que regulan el uso del marketplace.
          </p>

          {/* Uso de la plataforma */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              1. Uso de la plataforma
            </h2>

            <p>
              Flowjuyu es una plataforma digital diseñada para conectar
              compradores con vendedores de artesanía y textiles
              guatemaltecos.
            </p>

            <p className="mt-4">
              Los usuarios pueden crear cuentas para explorar productos,
              interactuar con vendedores y publicar artículos dentro del
              marketplace.
            </p>

          </section>

          {/* Cuentas */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              2. Creación de cuentas
            </h2>

            <p>
              Para utilizar ciertas funciones de la plataforma es
              necesario crear una cuenta.
            </p>

            <p className="mt-4">
              El usuario es responsable de mantener la confidencialidad
              de sus credenciales de acceso y de todas las actividades
              realizadas desde su cuenta.
            </p>

          </section>

          {/* Vendedores */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              3. Registro de vendedores
            </h2>

            <p>
              Los usuarios que deseen vender productos en Flowjuyu deben
              completar un proceso de registro como vendedor.
            </p>

            <p className="mt-4">
              La plataforma puede solicitar información adicional para
              verificar la identidad del vendedor, incluyendo documentos
              de identificación u otra información necesaria para la
              validación.
            </p>

          </section>

          {/* Publicación */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              4. Publicación de productos
            </h2>

            <p>
              Los vendedores son responsables de la información que
              publican sobre sus productos, incluyendo precios,
              descripciones e imágenes.
            </p>

            <p className="mt-4">
              Los productos publicados deben cumplir con las normas de la
              plataforma y no deben infringir derechos de terceros ni
              leyes aplicables.
            </p>

          </section>

          {/* Moderación */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              5. Moderación y suspensión
            </h2>

            <p>
              Flowjuyu se reserva el derecho de revisar, suspender o
              eliminar cuentas o contenido que incumpla las normas de la
              plataforma.
            </p>

            <p className="mt-4">
              Las cuentas de vendedores pueden ser suspendidas si se
              detecta actividad fraudulenta, incumplimiento de políticas
              o información falsa.
            </p>

          </section>

          {/* Responsabilidad */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              6. Responsabilidad del marketplace
            </h2>

            <p>
              Flowjuyu actúa como una plataforma intermediaria entre
              compradores y vendedores.
            </p>

            <p className="mt-4">
              La responsabilidad sobre los productos, precios,
              disponibilidad y calidad corresponde exclusivamente a los
              vendedores que los publican.
            </p>

          </section>

          {/* Propiedad intelectual */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              7. Propiedad intelectual
            </h2>

            <p>
              El contenido, diseño y estructura de la plataforma Flowjuyu
              están protegidos por derechos de propiedad intelectual.
            </p>

            <p className="mt-4">
              No está permitido copiar, reproducir o distribuir el
              contenido de la plataforma sin autorización.
            </p>

          </section>

          {/* Cambios */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              8. Cambios en los términos
            </h2>

            <p>
              Flowjuyu puede actualizar estos términos ocasionalmente
              para reflejar cambios en la plataforma o en la normativa
              aplicable.
            </p>

          </section>

          {/* Contacto */}

          <section>

            <h2 className="font-serif text-2xl mb-3 text-neutral-900">
              9. Contacto
            </h2>

            <p>
              Para consultas relacionadas con estos términos puedes
              escribir a:
            </p>

            <p className="mt-2 font-medium">
              contacto@flowjuyu.com
            </p>

          </section>

        </div>

      </div>

    </main>
  );
}